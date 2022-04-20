(ns com.kubelt.lib.init
  "SDK implementation."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.lib.detect :as detect]
   [com.kubelt.lib.multiaddr :as lib.multiaddr]
   [com.kubelt.lib.util :as util]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.proto.http :as proto.http])
  (:require
   #?@(:browser [[com.kubelt.lib.http.browser :as http.browser]]
       :node [[com.kubelt.lib.http.node :as http.node]]
       :clj [[com.kubelt.lib.http.jvm :as http.jvm]])))

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
  {;; Our connection to IPFS.
   :client/ipfs {:ipfs/multiaddr "/ip4/127.0.0.1/tcp/5001"
                 :client/http {}}
   ;; Our connection to the Kubelt p2p system. Typically write paths
   ;; will go through a kubelt managed http gateway.
   :client/p2p {:p2p/read {:http/scheme :http
                           :http/address "/ip4/127.0.0.1/tcp/8787"}
                :p2p/write {:http/scheme :http
                            :http/address "/ip4/127.0.0.1/tcp/8787"}}
   ;; A map from scope identifier to session token (JWT). Upon
   ;; successfully authenticating against a core, the returned session
   ;; token is kept here.
   :crypto/session {}
   ;; The current "wallet" implementation. This is provided externally
   ;; by the user.
   ;; TODO provide no-op wallet implementation, or try to detect wallet
   ;; in the environment, e.g. metamask in browser.
   :crypto/wallet {}})

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
        options (clj->js (merge url timeout))
        ;; Get the platform-specific HTTP client.
        http-client (get value :client/http)]
    (log/debug {:log/msg "init IPFS client" :ipfs/addr maddr-str})
    (try
      (let [;; TODO convert multiaddress to URL parts and pass in
            ;; options map to IPFS client.
            ;; http-scheme ""
            ;; http-host ""
            ;; http-port ""
            ;; options {:http/scheme http-scheme
            ;;          :http/host http-host
            ;;          :http/port http-port}
            options {:http/client http-client}]
        ;;(.create ipfs-http-client options)
        (ipfs.client/init options))
      (catch js/Error e
        (log/fatal e))
      (catch :default e
        (log/error {:log/msg "unexpected error" :error/value e})))))

(defmethod ig/halt-key! :client/ipfs [_ client]
  (log/debug {:log/msg "halt IPFS client"}))

;; :client/p2p
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :client/p2p [_ {:keys [p2p/read p2p/write] :as value}]
  ;; If we wanted to initialize a stateful client for the p2p system,
  ;; this would be the place. Since that system exposes a stateless HTTP
  ;; API, we'll just convert the multiaddresses we're given for the p2p
  ;; read/write nodes into more conventional coordinates (host, port) in
  ;; the system configuration map and pull them out when we need to make
  ;; a call.
  (let [;; read; get the multiaddr string and convert into a map
        ;; containing {:address/host :address/port}.
        read-maddr (get read :http/address)
        read-scheme (get read :http/scheme)
        read-address (-> read-maddr
                         lib.multiaddr/str->map
                         (assoc :http/scheme read-scheme))
        ;; write
        write-maddr (get write :http/address)
        write-scheme (get write :http/scheme)
        write-address (-> write-maddr
                          lib.multiaddr/str->map
                          (assoc :http/scheme write-scheme))
        ;; Format log messages.
        log-read (str (name read-scheme) "::" read-maddr)
        log-write (str (name write-scheme) "::" write-maddr)]
    (log/debug {:log/msg "init p2p client" :read/addr log-read :write/addr log-write})
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
  #?(:browser (http.browser/->HttpClient)
     :node (http.node/->HttpClient)
     :clj (http.jvm/->HttpClient))
  #_(condp = env
    :platform.type/browser (http.browser/->HttpClient)
    ;;:platform.type/jvm (http.jvm/->HttpClient)
    :platform.type/node (http.node/->HttpClient)))

(defmethod ig/halt-key! :client/http [_ client]
  {:pre [(satisfies? proto.http/HttpClient client)]}
  (log/debug {:log/msg "halt HTTP client"}))

;; :crypto/session
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :crypto/session [_ env]
  (log/debug {:log/msg "init session"})
  ;; Our session storage map is a "vault".
  {:com.kubelt/type :kubelt.type/vault
   :vault/tokens {}})

(defmethod ig/halt-key! :crypto/session [_ session]
  (log/debug {:log/msg "halt session"}))

;; :crypto/wallet
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :crypto/wallet [_ wallet]
  (log/debug {:log/msg "init wallet"})
  ;; If user provided a wallet, use it if it is valid. Otherwise, return
  ;; a placeholder wallet that will need to be replaced.
  (if-not (lib.wallet/valid? wallet)
    (throw (ex-info "invalid wallet" wallet))
    wallet))

(defmethod ig/halt-key! :crypto/wallet [_ wallet]
  (log/debug {:log/msg "halt wallet"}))

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
        ;; Use the wallet provided by the user, or default to a no-op
        ;; wallet otherwise.
        wallet (or (get options :crypto/wallet)
                   (lib.wallet/no-op))
        ;; Get p2p connection addresses determined by whether or not we
        ;; can detect a locally-running p2p node.
        default (:client/p2p system)
        p2p-options (detect/node-or-gateway default options)
        ;; Update the system configuration map before initializing the
        ;; system.
        system (-> system
                   (assoc :sys/platform platform)
                   (assoc :crypto/wallet wallet)
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
