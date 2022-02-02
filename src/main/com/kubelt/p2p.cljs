(ns com.kubelt.p2p
  "Entry point for p2p naming service."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [goog.Uri]
   [goog.object])
  (:require
   ["http" :as http :refer [IncomingMessage ServerResponse]]
   ["process" :as process]
   ["url" :as url :refer [Url]])
  (:require
   ["hyperbee" :as Hyperbee]
   ["hypercore" :as Hypercore]
   ["sd-notify" :as sd-notify]
   ["yargs" :as yargs :refer [Yargs]])
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :as async :refer [<! >! put! chan sliding-buffer]]
   [clojure.set :as cset]
   [clojure.string :as str])
  (:require
   [datascript.core :as ds]
   [integrant.core :as ig]
   [reitit.core :as route]
   [sieppari.core :as sieppari]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.path :as lib.path]
   [com.kubelt.lib.util :as lib.util]
   [com.kubelt.p2p.execute :as p2p.execute]
   [com.kubelt.p2p.interceptor :as p2p.interceptor]))

;; TODO D-Bus integration
;; TODO tracing with riemann? jaeger?
;; TODO error reporting using anomalies
;; TODO websocket support using sente
;; TODO generate API docs via reitit-swagger
;; TODO refer buddy-auth for jwt
;; TODO load config (just read environment? ig/read-string for edn config?)
;; TODO standard middleware using reitit-middleware
;; TODO integrate with SDK wallet implementation
;; TODO integrate with SDK jwt implementation
;; TODO integrate with SDK multiaddr implementation

(comment
  (d/transact! conn [{:db/id -1
                      :name "Maksim"
                      :age 45
                      :aka ["Max Otto von Stierlitz"
                            "Jack Ryan"]}])

  (d/q '[:find ?n ?a
         :where [?e :aka "Max Otto von Stierlitz"]
         [?e :name ?n]
         [?e :age ?a]]
       @conn))

(comment
  (route/match-by-path router "/kbt/1234")
  (route/match-by-name router ::kbt {:id 5534}))

;; Definitions
;; -----------------------------------------------------------------------------

;; Environment variable name prefix for app variables.
(def env-prefix
  "P2P_")

(def copyright-year
  2022)

(def copyright-author
  "Kubelt Inc.")

(def epilog
  (str "Copyright ©" copyright-year ", " copyright-author))

(def network-host
  "127.0.0.1")

(def network-port
  9061)

;; Timeout value in milliseconds for receiving the entire request from
;; the client.
(def timeout-ms
  2000)

;; The maximum number of requests socket can handle before closing keep
;; alive connection. A value of 0 will disable the limit.
(def max-socket
  2048)

;; Schema for in-memory Datalog database.
(def db-schema
  {:aka {:db/cardinality :db.cardinality/many}})

;; HTTP routing table.
;; TODO enable route data validation
;; TODO use top-level data to inject for all routes
;; TODO malli-based coercion of path params
;; TODO validate requests and responses
;; TODO JWT validate
;; TODO response type conversion
(def routes
  [["/kbt/:id"
    {:name ::kbt
     :http.method/all [p2p.interceptor/validate-jwt
                       p2p.interceptor/status-ok]
     :http.method/get {:interceptors [p2p.interceptor/kbt-resolve]}
     :http.method/post {:interceptors [p2p.interceptor/kbt-update]}}]
   ;; TODO user registration
   ["/register"
    {:name ::register
     :http.method/all [p2p.interceptor/status-ok]
     :http.method/post [p2p.interceptor/register]}]
   ;; TODO collect metrics
   ["/metrics"
    {:name ::metrics
     :http.method/all [p2p.interceptor/validate-jwt
                       p2p.interceptor/status-ok]
     :http.method/get [p2p.interceptor/metrics]}]
   ;; TODO return API version
   ["/version"
    {:name ::version
     :http.method/all [p2p.interceptor/validate-jwt
                       p2p.interceptor/status-ok]
     :http.method/get [p2p.interceptor/version]}]
   ["" {:no-doc true}
    ;; TODO set up swagger docs
    ["/api-docs" ::api-docs]
    ["/swagger.json" ::swagger]
    ["/health"
     ;; TODO kubernetes liveness check
     ["/live"
      {:name ::liveness-check
       :http.method/all [p2p.interceptor/status-no-content]
       :http.method/get [p2p.interceptor/health-live]}]
     ;; TODO kubernetes readiness check
     ["/ready"
      {:name ::readiness-check
       :http.method/all [p2p.interceptor/status-no-content]
       :http.method/get [p2p.interceptor/health-ready]}]]]])

;; System
;; -----------------------------------------------------------------------------

;;
;; :db/memory
;;

(defmethod ig/init-key :db/memory [_ {:keys [db/schema]}]
  (log/info {:log/msg "init memory database"})
  (ds/create-conn schema))

(defmethod ig/halt-key! :db/memory [_ db]
  (log/info {:log/msg "halt memory database"}))

;;
;; :http/router
;;

(defmethod ig/init-key :http/router [_ {:keys [http/routes]}]
  (log/info {:log/msg "init HTTP router"})
  (route/router routes))

(defmethod ig/halt-key! :http/router [_ router]
  (log/info {:log/msg "halt HTTP router"}))

;;
;; :http/server
;;

;; TODO pause
;; TODO resume

;; TODO edn / transit / json support (negotiation; cf. metosin libraries)
;; TODO place requests onto channel

(defmethod ig/init-key :http/server [_ value]
  ;; Extract parameters from the given configuration.
  (let [host (get value :net/host)
        port (get value :net/port)
        request-timeout (get value :request/timeout)
        max-socket-requests (get value :request/max-socket)
        ;; Invoked on each HTTP request handled by the server. This fn
        ;; looks for a matching route in the route table and, if it
        ;; finds one, sets up and executes the corresponding interceptor
        ;; chain. The argument map contains values that will be set on
        ;; the execution context for use by the interceptors.
        on-request (p2p.execute/make-request-handler
                    (select-keys value [:db/memory :http/router :hyper/bee]))
        server (.createServer http on-request)]
    ;; TODO Are there other server values we should set explicitly?
    ;; - TLS certificate!
    ;; - headersTimeout
    ;; - maxHeadersCount
    ;; - timeout
    ;; - keepAliveTimeout
    (set! (.-requestTimeout server) request-timeout)
    (set! (.-maxRequestsPerSocket server) max-socket-requests)
    (log/info {:log/msg "init HTTP server" :net/host host :net/port port})
    (let [options #js {"host" host "port" port}]
      (letfn [(on-listen []
                (log/info {:log/msg "listening for connections"}))]
        (doto server
          (.listen options on-listen))))))

(defmethod ig/halt-key! :http/server [_ server]
  (letfn [(on-close []
            (log/info {:log/msg "halt HTTP server"}))]
    (.close server on-close)))

;;
;; :hyper/bee
;;

(defmethod ig/init-key :hyper/bee [_ value]
  (let [feed (get value :hyper/core)
        key-encoding (get value :key/encoding)
        value-encoding (get value :value/encoding)
        options #js {:keyEncoding key-encoding
                     :valueEncoding value-encoding}]
    (log/info {:log/msg "init hyperbee"
               :key/encoding key-encoding
               :value/encoding value-encoding})
    (Hyperbee. feed options)))

(defmethod ig/halt-key! :hyper/bee [_ bee]
  (log/info {:log/msg "halt hyperbee"}))

;;
;; :hyper/core
;;

(defmethod ig/init-key :hyper/core [_ value]
  (let [encoding (get value :value/encoding)
        path (get value :path/dataset)
        options #js {:valueEncoding encoding}]
    (log/info {:log/msg "init hypercore"
               :value/encoding encoding
               :path/dataset path})
    (Hypercore. path options)))

(defmethod ig/halt-key! :hyper/core [_ core]
  (log/info {:log/msg "halt hypercore"}))

;; CLI
;; -----------------------------------------------------------------------------

(def cli-options
  (clj->js
   {"l" {:alias "log-level"
         :describe "The level of log message to output"
         :type "string"
         :choices #js ["info" "debug" "error"]
         :nargs 1
         :default "info"}
    "h" {:alias "host"
         :describe "The host address to bind to"
         :type "string"
         :nargs 1}
    "p" {:alias "port"
         :describe "The port to listen on"
         :type "number"
         :nargs 1}
    "t" {:alias "timeout-ms"
         :describe "Duration in ms to wait for requests to complete"
         :type "number"
         :nargs 1}
    "s" {:alias "max-socket"
         :describe "Maximum number of socket requests"
         :type "number"
         :nargs 1}}))

;; TODO expose additional configuration options, e.g. timeout.
(defn parse-args
  [args]
  (let [js-args (clj->js (sequence args))
        args (-> ^js yargs
                 ;; Program options.
                 (.options cli-options)
                 ;; Display usage string.
                 (.usage "Usage: $0 -h [ip-address] -p [port]")
                 ;; Show example usage.
                 (.example "$0 -h 192.168.1.128"
                           "Run using a non-default host address.")
                 ;; Display a summary line.
                 (.epilog epilog)
                 ;; Display help information.
                 (.help)
                 ;; Reject non-explicit arguments.
                 (.strict)
                 ;; Parse the CLI arguments and return a #js {}.
                 (.parse js-args))]
    (-> args
        ;; The parsed arguments are returned as a #js object. Convert to
        ;; a CLJS map with keywords as keys.
        (js->clj :keywordize-keys true)
        ;; yargs adds the keys as "nil" when you use .option, but :or
        ;; works better if you don't even have the key
        ;;(dissoc-nil :file :f :constant)
        (cset/rename-keys {:_ :args}))))

;; Config
;; -----------------------------------------------------------------------------

;; TODO load configuration from file? Should we use ig/read-string?
(defn load-config
  [app-name]
  (let [data-dir (lib.path/data app-name)]
    {:db/memory
     {:db/schema db-schema}

     :http/router
     {:http/routes routes}

     :http/server
     {:net/host network-host
      :net/port network-port
      :request/timeout timeout-ms
      :request/max-socket max-socket
      :http/router (ig/ref :http/router)
      :db/memory (ig/ref :db/memory)
      :hyper/bee (ig/ref :hyper/bee)}

     :hyper/bee
     {:hyper/core (ig/ref :hyper/core)
      :key/encoding "utf-8"
      :value/encoding "utf-8"}

     :hyper/core
     {:value/encoding "utf-8"
      :path/dataset data-dir}}))

(defn get-environment
  "Return a map of application environment variables. These are the
  variables that have a given prefix, determined by the prefix
  argument. The keys in the returned map are keywords derived from the
  environment variable name."
  [prefix]
  {:pre [(string? prefix)]}
  (letfn [(has-prefix? [[s _]]
            (str/starts-with? s prefix))
          (strip-prefix [[s v]]
            [(str/replace s prefix "") v])
          (to-lower [[k v]]
            [(str/lower-case k) v])
          (to-keyword [[k v]]
            [(keyword k) v])]
    (let [environment (lib.util/environment)
          xf (comp
              (filter has-prefix?)
              (map strip-prefix)
              (map to-lower)
              (map to-keyword))]
      (into {} xf environment))))

;; Implementation
;; -----------------------------------------------------------------------------

(defn init-system
  "Given a system config map, a map of application environment variables,
  and command line options, return an updated system map to start the
  system with."
  [config environment options]
  {:pre [(every? map? [config environment options])]}
  (let [host
        (or (get environment :host)
            (get options :host)
            (get-in config [:http/server :net/host]))
        port
        (or (get environment :port)
            (get options :port)
            (get-in config [:http/server :net/port]))
        timeout-ms
        (or (get environment :timeout-ms)
            (get options :timeout-ms)
            (get-in config [:http/server :request/timeout]))
        max-socket
        (or (get environment :max-socket)
            (get options :max-socket)
            (get-in config [:http/server :request/max-socket]))
        path-dataset
        (or (get environment :path-dataset)
            (get options :path-dataset)
            (get-in config [:hyper/core :path/dataset]))]
    (-> config
        (assoc-in [:http/server :net/host] host)
        (assoc-in [:http/server :net/port] port)
        (assoc-in [:http/server :request/timeout] timeout-ms)
        (assoc-in [:http/server :request/max-socket] max-socket)
        (assoc-in [:hyper/core :path/dataset] path-dataset))))

(defn stop! []
  (log/warn {:log/type :app/stop :log/msg "stopping"}))

(defn start! []
  (log/warn {:log/type :app/start :log/msg "starting"}))

;; TODO set up signal handler; call ig/halt! for (kubernetes-)clean
;; teardown
(defn main! [& cli-args]
  (let [options (parse-args cli-args)
        app-name (get options :$0)
        config (load-config app-name)
        environ (get-environment env-prefix)
        system (init-system config environ options)
        sys-map (ig/init system)]
    (letfn [(on-shutdown []
              (log/info {:log/msg "shutting down"})
              (ig/halt! sys-map))]
      (doto process
        (.on "SIGINT" on-shutdown)
        (.on "SIGTERM" on-shutdown)))
    (when-let [log-level (get options :log-level)]
      (let [log-level (keyword log-level)]
        (log/merge-config! {:min-level log-level})
        (log/info {:log/msg "running p2p" :log/level log-level})))
    ;; Notify systemd that we are initialized and ready to run.
    (.ready sd-notify)))
