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
   [cognitect.transit :as transit])
  (:require
   [com.kubelt.lib.multiaddr :as ma]
   [com.kubelt.lib.jwt :as jwt]
   [com.kubelt.proto.http :as http]))

(defn register!
  "Register an account, performing any initial setup that is required. The
  account is a map that contains the public key from the keypair that
  represents the user's account."
  [sys wallet]
  ;; TODO get nonce
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        public-key (get wallet :wallet/public-key)
        ;;path (str/join "/" ["" "register" public-key])
        path "/auth"
        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body "{\"pk\": \"hereiam\"}"
                 ;; TODO read scheme from sys
                 :uri/scheme :http
                 :uri/domain host
                 :uri/path path
                 :uri/port port}]
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
  [sys wallet key value]
  ;; TODO register public key with initial (register!)
  ;; call?
  (let [client (get sys :client/http)
        ;; If you need to know what platform you're running on, you
        ;;can get the value of :sys/platform from the system map.
        ;;platform (get sys :sys/platform)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        path (str/join "/" ["" "kbt" key])
        public-key (get wallet :account/public-key)
        body {:kbt/name key
              :kbt/value value
              :key/public public-key}
        ;; TODO sign request using user key pair
        ;;body-str (<p! (jwt/sign body))
        transit-writer (transit/writer :json)
        body-str (transit/write transit-writer body)
        headers {"Content-Type" "application/transit+json"}
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/headers headers
                 :http/body body-str
                 ;;:uri/scheme scheme
                 :uri/scheme :http
                 :uri/domain host
                 :uri/port port
                 :uri/path path}]
    ;; (attach a signature to the request that p2p node can use to
    ;; validate that the request came from the owner of the public key
    ;; that was used to register; prefer an existing web request signing
    ;; standard)
    ;;
    ;; Returns a core.async channel.
    (http/request! client request)))

(defn query!
  "Retrieve the value for a given key for a given user account. Returns a
  core.async channel."
  [sys wallet key]
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/read :address/host])
        port (get-in sys [:client/p2p :p2p/read :address/port])
        public-key (get wallet :wallet/public-key)
        path (str/join "/" ["" "kbt" public-key])
        ;; TODO JWT sign request?
        request {:kubelt/type :kubelt.type/http-request
                 ;; TODO make this a default
                 ;;:http/version "1.1"
                 ;; TODO make this a default
                 :http/method :get
                 ;;:uri/scheme scheme
                 :uri/scheme :http
                 :uri/domain host
                 :uri/port port
                 :uri/path path}]
    ;; TODO extract user's public key from the account map
    ;; (for use as account identifier)
    (http/request! client request)))
