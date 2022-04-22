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
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.proto.http :as proto.http])
  (:require
   #?@(:browser [[com.kubelt.lib.http.browser :as http.browser]]
       :node [[com.kubelt.lib.http.node :as http.node]]
       :clj [[com.kubelt.lib.http.jvm :as http.jvm]])))


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
  [system-config]
  (ig/init system-config))

(defn halt!
  "Clean-up resources used by the SDK."
  [sys-map]
  (ig/halt! sys-map))
