(ns com.kubelt.lib.init
  "SDK system map implementation."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.integrant :as lib.integrant]
   [com.kubelt.lib.jwt :as lib.jwt]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.vault :as lib.vault]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.proto.http :as proto.http])
  (:require
   #?@(:browser [[com.kubelt.lib.http.browser :as http.browser]]
       :clj [[com.kubelt.lib.http.jvm :as http.jvm]]
       :cljs [[com.kubelt.lib.http.browser :as http.browser]]
       :node [[com.kubelt.lib.http.node :as http.node]])))

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

;; :log/level
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :log/level [_ log-level]
  ;; Initialize the logging system.
  (when log-level
    (log/merge-config! {:min-level log-level}))
  log-level)

(defmethod ig/halt-key! :log/level [_ log-level]
  (log/debug {:log/msg "halt logging"}))

;; :ipfs.read/scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.read/scheme [_ scheme]
  scheme)

;; :ipfs.read/host
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.read/host [_ host]
  host)

;; :ipfs.read/port
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.read/port [_ port]
  port)

;; :ipfs.write/scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.write/scheme [_ scheme]
  scheme)

;; :ipfs.write/host
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.write/host [_ host]
  host)

;; :ipfs.write/port
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :ipfs.write/port [_ port]
  port)

;; :p2p/scheme
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/scheme [_ scheme]
  scheme)

;; :p2p/host
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/host [_ host]
  host)

;; :p2p/port
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :p2p/port [_ port]
  port)

;; :credential/jwt
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :credential/jwt [_ tokens]
  tokens)

;; :client/http
;; -----------------------------------------------------------------------------
;; TODO support custom user agent string.

(defmethod ig/init-key :client/http [_ value]
  {:post [(not (nil? %))]}
  (log/debug {:log/msg "init HTTP client"})
  #?(:browser (http.browser/->HttpClient)
     :clj (http.jvm/->HttpClient)
     :cljs (http.browser/->HttpClient)
     :node (http.node/->HttpClient)))

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
        read-scheme (get-in value [:ipfs/read :http/scheme])
        read-host (get-in value [:ipfs/read :http/host])
        read-port (get-in value [:ipfs/read :http/port])
        write-scheme (get-in value [:ipfs/write :http/scheme])
        write-host (get-in value [:ipfs/write :http/host])
        write-port (get-in value [:ipfs/write :http/port])
        ;; Get the platform-specific HTTP client.
        http-client (get value :client/http)
        make-url (fn [scheme host port]
                   (str (name read-scheme) "://" read-host ":" read-port))
        ipfs-read (make-url read-scheme read-host read-port)
        ipfs-write (make-url write-scheme write-host write-port)]
    (log/debug {:log/msg "init IPFS client" :ipfs/read ipfs-read :ipfs/write ipfs-write})
    ;; Create the options object we pass to client creation fn.
    #?(:cljs
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
         (-> (ipfs.client/init options)
             (lib.promise/then (fn [x] (lib.promise/resolved x)))
             (lib.promise/catch (fn [e]
                                  (log/fatal ::error e)
                                  (log/fatal ::mocking-ipfs-client "TODO: FIX IN CI")
                                  (lib.promise/resolved
                                   {:com.kubelt/type :kubelt.type/ipfs-client
                                    :http/client :mock
                                    :node/read "http:///ip4/127.0.0.1/tcp/5001"
                                    :node/write "http:///ip4/127.0.0.1/tcp/5001"}))))))))

(defmethod ig/halt-key! :client/ipfs [_ client]
  (log/debug {:log/msg "halt IPFS client"}))

;; :client/p2p
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :client/p2p [_ {:keys [http/scheme http/host http/port] :as value}]
  ;; TODO initialize an RPC client using the given coordinates once
  ;; local client is fleshed out.
  (let [address (str (name scheme) "://" host ":" port)]
    (log/debug {:log/msg "init p2p client" :p2p/address address})
    value))

(defmethod ig/halt-key! :client/p2p [_ value]
  (log/debug {:log/msg "halt p2p client"}))

;; :crypto/session
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :crypto/session [_ {:keys [jwt/tokens]}]
  (log/debug {:log/msg "init session"})
  ;; If any JWTs are provided, parse them and store the decoded result.
  (let [tokens (reduce (fn [m [core token]]
                         (let [decoded (lib.jwt/decode token)]
                           (assoc m core decoded)))
                       {}
                       tokens)]
    ;; Our session storage map is a "vault".
    (lib.vault/vault tokens)))

(defmethod ig/halt-key! :crypto/session [_ session]
  (log/debug {:log/msg "halt session"}))

;; :crypto/wallet
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :crypto/wallet [_ wallet]
  (log/debug {:log/msg "init wallet"})
  (if-not (lib.wallet/valid? wallet)
    (throw (ex-info "invalid wallet" wallet))
    wallet))

(defmethod ig/halt-key! :crypto/wallet [_ wallet]
  (log/debug {:log/msg "halt wallet"}))

;; Public
;; -----------------------------------------------------------------------------
;; NB: the configuration map is validated by the exposed SDK methods.

(defn init
  "Initialize the SDK."
  [system-config resolve reject]
  (if (lib.error/error? system-config)
    (reject system-config)
    (-> system-config
        ;; TEMP
        (dissoc :client/ipfs)
        (lib.integrant/init resolve reject))))

(defn halt!
  "Clean-up resources used by the SDK."
  [sys-map]
  (ig/halt! sys-map))
