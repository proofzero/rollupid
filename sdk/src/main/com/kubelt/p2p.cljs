(ns com.kubelt.p2p
  "Entry point for p2p naming service."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["http" :as http :refer [IncomingMessage ServerResponse]])
  (:require
   ["hyperbee" :as Hyperbee]
   ["hypercore" :as Hypercore])
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :as async :refer [<! >! put! chan sliding-buffer]])
  (:require
   [cognitect.transit :as transit]
   [datascript.core :as ds]
   [integrant.core :as ig]
   [reitit.core :as route]
   [sieppari.core :as chain]
   [taoensso.timbre :as log]))

;; riemann? jaeger?
;; anomalies
;; sente
;; config (just read environment? ig/read-string for edn config?)
;; reitit-swagger
;; reitit-middleware
;; tools.cli
;; cf. buddy-auth (jwt)

(comment
  (def r (transit/reader :json))
  (def w (transit/writer :json))
  (transit/write w [1 2 3])
  (transit/write w {:foo "bar"})
  (transit/read r "[1,2,3]"))

(comment
  (r/match-by-path router "/kbt/1234")
  (r/match-by-name router ::kbt {:id 5534}))

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

;; Definitions
;; -----------------------------------------------------------------------------

(def network-host
  "127.0.0.1")

(def network-port
  8081)

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
(def routes
  [["/kbt/:id" ::kbt]])

;; System
;; -----------------------------------------------------------------------------

(def system
  {:db/memory
   {:db/schema db-schema}

   :http/router
   {:http/routes routes}

   :http/server
   {:net/host network-host
    :net/port network-port
    :request/timeout timeout-ms
    :request/max-socket max-socket}

   :hyper/bee
   {:hyper/core (ig/ref :hyper/core)
    :key/encoding "utf-8"
    :value/encoding "binary"}

   :hyper/core
   {:value/encoding "utf-8"
    :path/dataset "./p2p-dataset"}})

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

(declare on-request)
(declare on-listen)

;; TODO pause
;; TODO resume

(defmethod ig/init-key :http/server [_ value]
  (let [host (get value :net/host)
        port (get value :net/port)
        request-timeout (get value :request/timeout)
        max-socket-requests (get value :request/max-socket)
        server (.createServer http on-request)]
    ;; TODO Are there other server values we should set explicitly?
    ;; - headersTimeout
    ;; - maxHeadersCount
    ;; - timeout
    ;; - keepAliveTimeout
    (set! (.-requestTimeout server) request-timeout)
    (set! (.-maxRequestsPerSocket server) max-socket-requests)
    (log/info {:log/msg "init HTTP server" :net/host host :net/port port})
    (let [options #js {"host" host "port" port}]
      (doto server
        (.listen options on-listen)))))

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

;; Implementation
;; -----------------------------------------------------------------------------

;; TODO edn / transit / json support (negotiation; cf. metosin libraries)
;; TODO place requests onto channel
;; TODO plug into router
;; TODO set up interceptor chains
(defn on-request
  [^IncomingMessage req ^ServerResponse res]
  (let [status 200]
    (log/info {:log/msg "request received" :http/status status})
    (doto res
      (.writeHead status #js {"Content-Type" "text/html"})
      (.end "<html><body><h1>Hello</h1></body></html>"))))

;; Called before
(defn stop! []
  (log/warn {:log/type :app/stop :log/msg "stopping"}))

(defn start! []
  (log/warn {:log/type :app/start :log/msg "starting"}))

;; TODO parse CLI arguments
;; TODO load configuration (env, config file)
;; TODO signal handler (call ig/halt! for clean teardown)
(defn main! [& cli-args]
  ;; TODO set logging min-level
  (log/info {:log/msg "running p2p"})
  ;; TODO update system map, e.g. set host/port for HTTP server
  (ig/init system))
