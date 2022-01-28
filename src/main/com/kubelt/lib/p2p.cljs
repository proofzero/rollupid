(ns com.kubelt.lib.p2p
  "Wrapper around the external p2p naming system."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require-macros
   [cljs.core.async.interop :refer [<p!]]
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :refer [<!]]
   [clojure.string :as str])
  (:require
   [com.kubelt.lib.multiaddr :as ma]
   [com.kubelt.lib.jwt :as jwt]
   [com.kubelt.proto.http :as http]))

(defn register!
  "Register an account, performing any initial setup that is required. The
  account is a map that contains the public key from the keypair that
  represents the user's account."
  [sys account]
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        key (get account :account/public-key)
        path (str/join "/" ["" "register" key])
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :get
                 :http/scheme scheme
                 :http/host host
                 :http/port port}]
    ;; TODO extract the user's public key from the account map
    ;; (for use as an account identifier)

    ;; TODO make an HTTP request to p2p system, passing along the pub key
    ;; (expect a nonce in return, which should be signed and returned to
    ;; prove ownership of provided key and complete registration? to what
    ;; extent is this flow already defined by OAuth, JWT, etc.?)
    (http/request! client request)))

(defn store!
  "Store a key/value pair for the given user account. Returns a core.async
  channel."
  [sys account key value]
  ;; TODO register public key with initial (register!)
  ;; call?
  (go
    (let [client (get sys :client/http)
          ;; If you need to know what platform you're running on, you
          ;;can get the value of :sys/platform from the system map.
          ;;platform (get sys :sys/platform)
          scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
          host (get-in sys [:client/p2p :p2p/write :address/host])
          port (get-in sys [:client/p2p :p2p/write :address/port])
          path (str/join "/" ["" "updatekbt"])
          public-key (get account :account/public-key)
          body {:kbtname key
                :endpoint value
                :pubkey public-key}
          ;; TODO sign request using user key pair
          body-str (<p! (jwt/sign body))
          headers {"Content-Type" "text/plain"}
          request {:kubelt/type :kubelt.type/http-request
                   :http/method :post
                   :http/scheme scheme
                   :http/host host
                   :http/port port
                   :http/path path
                   :http/headers headers
                   :http/body body-str}]
      ;; (attach a signature to the request that p2p node can use to
      ;; validate that the request came from the owner of the public key
      ;; that was used to register; prefer an existing web request signing
      ;; standard)
      ;;
      ;; Returns a core.async channel.
      (http/request! client request))))

(defn query!
  "Retrieve the value for a given key for a given user account. Returns a
  core.async channel."
  [sys account key]
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/read :address/host])
        port (get-in sys [:client/p2p :p2p/read :address/port])
        path (str/join "/" ["" "kbt" key])
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :get
                 :http/scheme scheme
                 :http/host host
                 :http/port port
                 :http/path path}]
    ;; TODO extract user's public key from the account map
    ;; (for use as account identifier)
    (http/request! client request)))
