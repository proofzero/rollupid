(ns com.kubelt.lib.init
  "SDK implementation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["ipfs-http-client" :as ipfs-http-client])
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.detect :as detect]
   [com.kubelt.lib.http.browser :as http.browser]
   [com.kubelt.lib.http.node :as http.node]
   [com.kubelt.lib.multiaddr :as multiaddr]
   [com.kubelt.lib.util :as util]
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
   :client/ipfs {:ipfs/multiaddr "/ip4/127.0.0.1/tcp/5001"}
   ;; Our connection to the Kubelt p2p system. Typically write paths
   ;; will go through a kubelt managed http gateway.
   :client/p2p {:p2p/read "/ip4/127.0.0.1/tcp/9061"
                :p2p/write "/ip4/127.0.0.1/tcp/9061"}
   :client/http :missing})

;; :client/ipfs
;; -----------------------------------------------------------------------------
;; Send headers with each request:
;;  token "xyzabc123"
;;  authorization (str "Bearer " token)
;;  user-agent "X-Kubelt"
;;  headers {:headers {:authorization authorization
;;                     :user-agent user-agent}}
;;
;; Use an http.Agent (node-only) to control client behavior:
;;   agent {:agent (.. http Agent.)}

(defmethod ig/init-key :client/ipfs [_ value]
  (let [;; Set a global timeout for *all* requests:
        timeout {:timeout "2m"}
        ;; Supply the address of the IPFS node:
        maddr-str (get value :ipfs/multiaddr)
        url {:url maddr-str}
        ;; Create the options object we pass to client creation fn.
        options (clj->js (merge url timeout))]
    (log/debug {:log/msg "init IPFS client" :ipfs/addr maddr-str})
    (try
      (.create ipfs-http-client options)
      (catch js/Error e
        (log/fatal e))
      (catch :default e
        (log/error {:log/msg "unexpected error" :error/value e})))))

(defmethod ig/halt-key! :client/ipfs [_ client]
  (log/debug {:log/msg "halt IPFS client"}))

;; :client/p2p
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :client/p2p [_ value]
  ;; If we wanted to initialize a stateful client for the p2p system,
  ;; this would be the place. Since that system exposes a stateless HTTP
  ;; API, we'll just convert the multiaddresses we're given for the p2p
  ;; read/write nodes into more conventional coordinates (host, port) in
  ;; the system configuration map and pull them out when we need to make
  ;; a call.
  (let [;; read; get the multiaddr string and convert into a map
        ;; containing {:address/host :address/port}.
        read-maddr (get value :p2p/read)
        read-address (multiaddr/str->map read-maddr)
        ;; write
        write-maddr (get value :p2p/write)
        write-address (multiaddr/str->map read-maddr)]
    (log/debug {:log/msg "init p2p client" :net/read read-maddr :net/write write-maddr})
    (-> value
        (assoc :p2p/read read-address)
        (assoc :p2p/write write-address))))

(defmethod ig/halt-key! :client/p2p [_ value]
  (log/debug {:log/msg "halt p2p client"}))

;; :client/http
;; -----------------------------------------------------------------------------
;; TODO if possible, we want that when compiling an environment-specific
;; variant of the SDK that we are optimizing away whichever of these
;; HttpClient protocol reifications isn't used.

;; We expect the value to be a keyword naming the execution environment
;; that we are initializing for.
(defmethod ig/init-key :client/http [_ env]
  {:post [(not (nil? %))]}
  (log/debug {:log/msg "init HTTP client [" env "]"})
  (condp = env
    :platform.type/browser (http.browser/->HttpClient)
    ;;:platform.type/jvm (http.jvm/->HttpClient)
    :platform.type/node (http.node/->HttpClient)))

(defmethod ig/halt-key! :client/http [_ client]
  {:pre [(satisfies? proto.http/HttpClient client)]}
  (log/debug {:log/msg "halt HTTP client"}))

;; :sys/platform
;; -----------------------------------------------------------------------------

;; TODO any platform-specific setup.
(defmethod ig/init-key :sys/platform [_ platform]
  (log/debug {:log/msg "init platform" :sys/platform platform})
  platform)

;; TODO any platform-specific teardown.
(defmethod ig/halt-key! :sys/platform [_ platform]
  (log/debug {:log/msg "halt platform"}))

;; Public
;; -----------------------------------------------------------------------------
;; NB: the configuration map is validated by the exposed SDK methods.

;; TODO top-level environment key should be injected into sub-keys that
;; depend on it.
(defn init
  "Initialize the SDK."
  [{:keys [logging/min-level] :as options}]
  ;; Initialize the logging system.
  (when min-level
    (log/merge-config! {:min-level min-level}))
  ;; NB: inject supplied configuration into the system map before
  ;; calling ig/init. The updated values will be passed to the system
  ;; init fns.
  (let [;; Initialize for given platform if specified by user, or detect
        ;; the current platform and initialize accordingly, otherwise.
        platform (or (get options :sys/platform)
                     (util/platform))
        ;; Get p2p connection addresses determined by whether or not we
        ;; can detect a locally-running p2p node.
        p2p-options (detect/node-or-gateway options)
        ;; Update the system configuration map before initializing the
        ;; system.
        system (-> system
                   (assoc :sys/platform platform)
                   (assoc :client/http platform)
                   (assoc :client/p2p p2p-options))]
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
