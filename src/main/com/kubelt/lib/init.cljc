(ns com.kubelt.lib.init
  "SDK implementation."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.lib.jwt :as lib.jwt]
   [com.kubelt.lib.multiaddr :as lib.multiaddr]
   [com.kubelt.lib.util :as util]
   [com.kubelt.lib.vault :as lib.vault]
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
   :ipfs.read/multiaddr nil
   :ipfs.read/scheme nil
   :ipfs.write/multiaddr nil
   :ipfs.write/scheme nil
   :p2p/scheme nil
   :p2p/multiaddr nil
   ;; Our common HTTP client.
   :client/http {}
   ;; Our connection to IPFS.
   :client/ipfs {:ipfs/read {:http/scheme (ig/ref :ipfs.read/scheme)
                             :ipfs/multiaddr (ig/ref :ipfs.read/multiaddr)}
                 :ipfs/write {:http/scheme (ig/ref :ipfs.write/scheme)
                              :ipfs/multiaddr (ig/ref :ipfs.write/multiaddr)}
                 :client/http (ig/ref :client/http)}
   ;; Our connection to the Kubelt p2p system.
   :client/p2p {:http/scheme (ig/ref :p2p/scheme)
                :p2p/multiaddr (ig/ref :p2p/multiaddr)}
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

(defmethod ig/init-key :ipfs.read/multiaddr [_ address]
  ;; Return the multiaddress string.
  address)

;; :ipfs/read-scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.read/scheme [_ scheme]
  scheme)

;; :ipfs/write-addr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.write/multiaddr [_ address]
  address)

;; :ipfs/write-scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.write/scheme [_ scheme]
  scheme)

;; :p2p/multiaddr
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/multiaddr [_ address]
  address)

;; :p2p/scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/scheme [_ scheme]
  scheme)

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
        read-map (lib.multiaddr/str->map read-addr)
        read-host (:address/host read-map)
        read-port (:address/port read-map)
        read-scheme (get-in value [:ipfs/read :http/scheme])
        write-addr (get-in value [:ipfs/write :ipfs/multiaddr])
        write-map (lib.multiaddr/str->map write-addr)
        write-host (:address/host write-map)
        write-port (:address/port write-map)
        write-scheme (get-in value [:ipfs/write :http/scheme])
        ;; Get the platform-specific HTTP client.
        http-client (get value :client/http)]
    (let [ipfs-read (str (name read-scheme) "://" read-addr)
          ipfs-write (str (name write-scheme) "://" write-addr)]
      (log/debug {:log/msg "init IPFS client" :ipfs/read ipfs-read :ipfs/write ipfs-write}))
    (try
      ;; Create the options object we pass to client creation fn.
      (let [options {:http/client http-client
                     :read/scheme read-scheme
                     :read/host read-host
                     :read/port read-port
                     :write/scheme write-scheme
                     :write/host write-host
                     :write/port write-port
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

(defmethod ig/init-key :client/p2p [_ {:keys [http/scheme p2p/multiaddr] :as value}]
  ;; If we wanted to initialize a stateful client for the p2p system,
  ;; this would be the place. Since that system exposes a stateless HTTP
  ;; API, we'll just convert the multiaddresses we're given for the p2p
  ;; read/write nodes into more conventional coordinates (host, port) in
  ;; the system configuration map and pull them out when we need to make
  ;; a call.
  (let [p2p-addr (str (name scheme) "://" multiaddr)]
    (log/debug {:log/msg "init p2p client" :p2p/address p2p-addr}))
  (let [;; Get the multiaddr string and convert into a map
        ;; containing {:address/host :address/port}.
        address (lib.multiaddr/str->map multiaddr)
        host (get address :address/host)
        port (get address :address/port)]
    (-> value
        (assoc :http/scheme scheme)
        (assoc :http/host host)
        (assoc :http/port port))))

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
        ;; Get the address of the IPFS node we talk to.
        ipfs-read-maddr (get options :ipfs.read/multiaddr)
        ipfs-read-scheme (get options :ipfs.read/scheme)
        ipfs-write-maddr (get options :ipfs.write/multiaddr)
        ipfs-write-scheme (get options :ipfs.write/scheme)
        ;; Get the address of the Kubelt gateway we talk to.
        p2p-scheme (get options :p2p/scheme)
        p2p-multiaddr (get options :p2p/multiaddr)
        ;; Get the default minimum log level.
        log-level (get options :log/level)
        ;; Update the system configuration map before initializing the
        ;; system.
        system (-> system
                   (assoc :log/level log-level)
                   (assoc :ipfs.read/multiaddr ipfs-read-maddr)
                   (assoc :ipfs.read/scheme ipfs-read-scheme)
                   (assoc :ipfs.write/multiaddr ipfs-write-maddr)
                   (assoc :ipfs.write/scheme ipfs-write-scheme)
                   (assoc :p2p/scheme p2p-scheme)
                   (assoc :p2p/multiaddr p2p-multiaddr)
                   (assoc :crypto/session credentials)
                   (assoc :crypto/wallet wallet))]
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
  (let [ipfs-read-maddr (get sys-map :ipfs.read/multiaddr)
        ipfs-read-scheme (get sys-map :ipfs.read/scheme)
        ipfs-write-maddr (get sys-map :ipfs.write/multiaddr)
        ipfs-write-scheme (get sys-map :ipfs.write/scheme)
        p2p-multiaddr (get sys-map :p2p/multiaddr)
        p2p-scheme (get sys-map :p2p/scheme)
        log-level (get sys-map :log/level)
        ;; TODO rename :crypto/session to :crypto/vault for clarity
        credentials (lib.vault/tokens (:crypto/session sys-map))
        wallet (get sys-map :crypto/wallet)]
    {:log/level log-level
     :ipfs.read/multiaddr ipfs-read-maddr
     :ipfs.read/scheme ipfs-read-scheme
     :ipfs.write/multiaddr ipfs-write-maddr
     :ipfs.write/scheme ipfs-write-scheme
     :p2p/scheme p2p-scheme
     :p2p/multiaddr p2p-multiaddr
     :crypto/wallet wallet
     :credential/jwt credentials}))
