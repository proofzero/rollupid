(ns com.kubelt.sdk.impl.init
  "SDK implementation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["ipfs-http-client" :as ipfs-http])
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.sdk.impl.http.browser :as http.browser]
   [com.kubelt.sdk.impl.http.node :as http.node]
   [com.kubelt.sdk.proto.http :as proto.http]))

;; System
;; -----------------------------------------------------------------------------
;; For each key in the system map, if a corresponding method is
;; implemented for the ig/init-key multimethod it will be invoked in
;; order to initialize that part of the system. The return value is
;; stored as part of the system configuration map. Initialization is
;; performed recursively, making it possible to have nested subsystems.
;;
;; If methods are defined for the ig/halt-key! multimethod, they are
;; invoked in order to tear down the system in the reverse order in
;; which it was initialized.
;;
;; To begin the system:
;;   (integrant.core/init)
;; To stop the system:
;;   (integrant.core/halt!)
;;
;; Cf. https://github.com/weavejester/integrant.

(def system
  {;; Our connection to IPFS. Uses the ipfs-http-client from node.
   :adapter/ipfs {:ipfs/host "127.0.0.1"
                  :ipfs/port 5001}
   ;; Our connection to the Kubelt p2p system.
   :client/p2p {:p2p/host "127.0.0.1"
                :p2p/port 9061}
   :client/http :missing})

;; :adapter/ipfs
;; -----------------------------------------------------------------------------
;; TODO support different URI:
;; - create("http://127.0.0.1:5002")
;; other ways to initialize the client:
;; - create(new URL(...));
;; - create("/ip4/127.0.0.1/tcp/5001")
;; - create({host: "localhost", port: "5001", protocol: "http"})
;; - create({host: "1.1.1.1", port: "80", apiPath: "/ipfs/api/v0"})
;; send headers with each request:
;; - create({..., headers: {authorization: "Bearer " + TOKEN}})
;; set a global timeout for *all* requests:
;; - create({timeout: '2m'})
;; use an http.Agent (node-only) to control client behavior:
;; - create({agent: http.Agent()})

(defmethod ig/init-key :adapter/ipfs [_ value]
  (log/debug "init IPFS adapter")
  (let [ipfs-host (get value :ipfs/host)
        ipfs-port (get value :ipfs/port)
        options #js {"host" ipfs-host "port" ipfs-port}
        client (.create ipfs-http options)]
    {:client/ipfs client}))

(defmethod ig/halt-key! :adapter/ipfs [_ client]
  (log/debug "halt IPFS adapter"))

;; :client/p2p
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :client/p2p [_ value]
  (log/debug "init p2p client")
  ;; If we wanted to initialize a stateful client for the p2p system,
  ;; this would be the place. Since that system exposes a stateless HTTP
  ;; API, we'll just keep the coordinates of the service (host, port) in
  ;; the system configuration map and pull them out when we need to make
  ;; a call.
  value)

(defmethod ig/halt-key! :client/p2p [_ value]
  (log/debug "halt p2p client"))

;; :client/http
;; -----------------------------------------------------------------------------
;; TODO if possible, we want that when compiling an environment-specific
;; variant of the SDK that we are optimizing away whichever of these
;; HttpClient protocol reifications isn't used.

;; We expect the value to be a keyword naming the execution environment
;; that we are initializing for.
(defmethod ig/init-key :client/http [_ env]
  {:post [(not (nil? %))]}
  (log/debug "init HTTP client [" env "]")
  (condp = env
    :platform/browser (http.browser/->HttpClient)
    :platform/node (http.node/->HttpClient)))

(defmethod ig/halt-key! :client/http [_ client]
  {:pre [(satisfies? proto.http/HttpClient client)]}
  (log/debug "halt HTTP client"))

;; Public
;; -----------------------------------------------------------------------------
;; NB: the configuration map is validated by the exposed SDK methods.

(defn init
  "Initialize the SDK."
  [{:keys [logging/min-level] :as options}]
  ;; Initialize the logging system.
  (when min-level
    (log/merge-config! {:min-level min-level}))
  ;; NB: inject supplied configuration into the system map before
  ;; calling ig/init. The updated values will be passed to the system
  ;; init fns.
  (let [system
        (cond-> system
          ;; TODO detect current execution environment
          ;; TODO top-level environment key should be injected into
          ;; sub-keys that depend on it
          (contains? options :sys/platform)
          (assoc :client/http (get options :sys/platform))

          ;; If options map contains :p2p/host, set that value in the
          ;; system map.
          (contains? options :p2p/host)
          (assoc-in [:client/p2p :p2p/host] (get options :p2p/host))

          ;; If options map contains :p2p/port, set that value in the
          ;; system map.
          (contains? options :p2p/port)
          (assoc-in [:client/p2p :p2p/port] (get options :p2p/port)))]
    ;; NB: If we provide an additional collection of keys when calling
    ;; integrant.core/init, only those keys will be initialized.
    ;;
    ;; TODO use this mechanism to selectively initialize the system for
    ;; the current context, i.e. in browser, node cli client, etc.
    (ig/init system)))

(defn halt!
  "Clean-up resources used by the SDK."
  [sys-map]
  (ig/halt! sys-map))
