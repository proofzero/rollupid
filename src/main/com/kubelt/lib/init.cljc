(ns com.kubelt.lib.init
  "SDK implementation."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.lib.detect :as detect]
   [com.kubelt.lib.jwt :as lib.jwt]
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
  {;; These empty defaults should be overridden from the SDK init
   ;; options map.
   :log/level nil
   :ipfs/read-addr nil
   :ipfs/read-scheme nil
   :ipfs/write-addr nil
   :ipfs/write-scheme nil
   :p2p/read-addr nil
   :p2p/write-addr nil
   ;; Our common HTTP client.
   :client/http {}
   ;; Our connection to IPFS.
   :client/ipfs {:ipfs/read {:http/scheme :http
                             :ipfs/multiaddr (ig/ref :ipfs/read-addr)}
                 :ipfs/write {:http/scheme :http
                              :ipfs/multiaddr (ig/ref :ipfs/write-addr)}
                 :client/http (ig/ref :client/http)}
   ;; Our connection to the Kubelt p2p system. Typically write paths
   ;; will go through a kubelt managed http gateway.
   ;; TODO inject common HTTP client.
   :client/p2p {:p2p/read {:http/scheme :http
                           :http/address (ig/ref :p2p/read-addr)}
                :p2p/write {:http/scheme :http
                            :http/address (ig/ref :p2p/write-addr)}}
   ;; A map from scope identifier to session token (JWT). Upon
   ;; successfully authenticating against a core, the returned session
   ;; token is kept here.
   :crypto/session {}
   ;; The current "wallet" implementation. This is provided externally
   ;; by the user.
   ;; TODO provide no-op wallet implementation, or try to detect wallet
   ;; in the environment, e.g. metamask in browser.
   :crypto/wallet {}})

;; :log/level
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :log/level [_ min-level]
  ;; Initialize the logging system.
  (when min-level
    (log/merge-config! {:min-level min-level}))
  min-level)

;; :ipfs/read-addr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs/read-addr [_ address]
  ;; Return the multiaddress string.
  address)

;; :ipfs/read-scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs/read-scheme [_ scheme]
  scheme)

;; :ipfs/write-addr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs/write-addr [_ address]
  address)

;; :ipfs/write-scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs/write-scheme [_ scheme]
  scheme)

;; :p2p/read-addr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/read-addr [_ address]
  address)

;; :p2p/write-addr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/write-addr [_ address]
  address)

;; :client/http
;; -----------------------------------------------------------------------------
;; TODO support custom user agent string.

(defmethod ig/init-key :client/http [_ value]
  {:post [(not (nil? %))]}
  (log/debug {:log/msg "init HTTP client"})
  #?(:browser (http.browser/->HttpClient)
     :node (http.node/->HttpClient)
     :clj (http.jvm/->HttpClient)))

(defmethod ig/halt-key! :client/http [_ client]
  {:pre [(satisfies? proto.http/HttpClient client)]}
  (log/debug {:log/msg "halt HTTP client"}))

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
  (let [;; Supply the address of the IPFS node(s). Read and write can
        ;; use different paths if desired, e.g. when you want to read
        ;; from a local daemon but write to a remote service for
        ;; pinning.
        read-addr (get-in value [:ipfs/read :ipfs/multiaddr])
        read-scheme (get-in value [:ipfs/read :http/scheme])
        write-addr (get-in value [:ipfs/write :ipfs/multiaddr])
        write-scheme (get-in value [:ipfs/write :http/scheme])
        ;; Get the platform-specific HTTP client.
        http-client (get value :client/http)]
    (let [ipfs-read (str (name read-scheme) "://" read-addr)
          ipfs-write (str (name write-scheme) "://" write-addr)]
      (log/debug {:log/msg "init IPFS client" :ipfs/read ipfs-read :ipfs/write ipfs-write}))
    (try
      ;; Create the options object we pass to client creation fn.
      (let [;; TODO convert multiaddress to URL parts and pass in
            ;; options map to IPFS client.
            ;; http-scheme ""
            ;; http-host ""
            ;; http-port ""
            ;; options {:http/scheme http-scheme
            ;;          :http/host http-host
            ;;          :http/port http-port}
            options {:http/client http-client
                     :read/addr read-addr
                     :read/scheme read-scheme
                     :write/addr write-addr
                     :write/scheme write-scheme
                     ;; Set a global timeout for *all* requests:
                     ;;:client/timeout 5000
                     }]
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

;; :crypto/session
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :crypto/session [_ tokens]
  (log/debug {:log/msg "init session"})
  ;; If any JWTs are provided, parse them and store the decoded result.
  (let [tokens (reduce (fn [m [core token]]
                         (let [decoded (lib.jwt/decode token)]
                           (assoc m core decoded)))
                       {}
                       tokens)]
    ;; Our session storage map is a "vault".
    {:com.kubelt/type :kubelt.type/vault
     :vault/tokens tokens}))

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
  [options]
  ;; NB: inject supplied configuration into the system map before
  ;; calling ig/init. The updated values will be passed to the system
  ;; init fns.
  (let [;; Use any JWTs supplied as options.
        credentials (get options :credential/jwt {})
        ;; Use the wallet provided by the user, or default to a no-op
        ;; wallet otherwise.
        wallet (or (get options :crypto/wallet)
                   (lib.wallet/no-op))
        ;; Get p2p connection addresses determined by whether or not we
        ;; can detect a locally-running p2p node.
        default (:client/p2p system)
        p2p-options (detect/node-or-gateway default options)
        ;; Get the address of the IPFS node we talk to.
        ipfs-read (get options :ipfs/read)
        ipfs-read-scheme (get options :ipfs.read/scheme)
        ipfs-write (get options :ipfs/write)
        ipfs-write-scheme (get options :ipfs.write/scheme)
        ;; Get the r/w addresses of the Kubelt gateways we talk to.
        p2p-read (get options :p2p/read)
        p2p-write (get options :p2p/write)
        ;; Get the default minimum log level.
        log-level (get options :log/level)
        ;; Update the system configuration map before initializing the
        ;; system.
        system (-> system
                   (assoc :log/level log-level)
                   (assoc :ipfs/read-addr ipfs-read)
                   (assoc :ipfs/read-scheme ipfs-read-scheme)
                   (assoc :ipfs/write-addr ipfs-write)
                   (assoc :ipfs/write-scheme ipfs-write-scheme)
                   (assoc :p2p/read-addr p2p-read)
                   (assoc :p2p/write-addr p2p-write)
                   (assoc :crypto/session credentials)
                   (assoc :crypto/wallet wallet)
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

(defn options
  "Return an options map that can be used to reinitialize the SDK."
  [sys-map]
  (let [ipfs-read (get sys-map :ipfs/read-addr)
        ipfs-read-scheme (get-in sys-map [:client/ipfs :ipfs/read :http/scheme])
        ipfs-write (get sys-map :ipfs/write-addr)
        ipfs-write-scheme (get-in sys-map [:client/ipfs :ipfs/write :http/scheme])
        p2p-read (get sys-map :p2p/read-addr)
        p2p-read-scheme (get-in sys-map [:client/p2p :p2p/read :http/scheme])
        p2p-write (get sys-map :p2p/write-addr)
        p2p-write-scheme (get-in sys-map [:client/p2p :p2p/write :http/scheme])
        log-level (get sys-map :log/level)
        credentials {}]
    {:log/level log-level
     :ipfs/read ipfs-read
     :ipfs.read/scheme ipfs-read-scheme
     :ipfs/write ipfs-write
     :ipfs.write/scheme ipfs-write-scheme
     :p2p/read p2p-read
     :p2p.read/scheme p2p-read-scheme
     :p2p/write p2p-write
     :p2p.write/scheme p2p-write-scheme
     :credential/jwt credentials}))
