(ns com.kubelt.sdk.impl.p2p
  "Wrapper around the external p2p naming system."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [clojure.string :as str]
   [cljs.core.async :refer [<!]])
  (:require
   [com.kubelt.sdk.proto.http :as http]))

(defn register!
  "Register an account, performing any initial setup that is required. The
  account is a map that contains the public key from the keypair that
  represents the user's account."
  [sys account]
  (let [client (get sys :client/http)
        host (get-in sys [:client/p2p :p2p/host])
        port (get-in sys [:client/p2p :p2p/port])
        key (get account :account/public-key)
        path (str/join "/" ["" "register" key])
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :get
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
  "Store a key/value pair for the given user account."
  [sys account key value]
  (let [client (get sys :client/http)
        host (get-in sys [:client/p2p :p2p/host])
        port (get-in sys [:client/p2p :p2p/port])
        path (str/join "/" ["" "updatekbt" key value])
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/host host
                 :http/port port
                 :http/path path}]
    ;; TODO sign request using user key pair
    ;; (attach a signature to the request that p2p node can use to
    ;; validate that the request came from the owner of the public key
    ;; that was used to register; prefer an existing web request signing
    ;; standard)
    (http/request! client request)))

(defn query!
  "Retrieve the value for a given key for a given user account."
  [sys account key]
  (let [client (get sys :client/http)
        host (get-in sys [:client/p2p :p2p/host])
        port (get-in sys [:client/p2p :p2p/port])
        path (str/join "/" ["" "kbt" key])
        url (str "http://" host ":" port path)
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :get
                 :http/host host
                 :http/port port
                 :http/path path}]
    ;; TODO extract user's public key from the account map
    ;; (for use as account identifier)
    (http/request! client request)))
