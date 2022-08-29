(ns com.kubelt.lib.oort
  "Wrapper around the Oort backend."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   ["@ethersproject/providers" :refer [JsonRpcProvider]])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :as lib.promise]))

;; TODO .cljc

(defn- connection-uri [sys core]
  (let [scheme (get-in sys [:client/oort :http/scheme])
        host (get-in sys [:client/oort :http/host])
        port (get-in sys [:client/oort :http/port])
        path (cstr/join "" ["/" core "/jsonrpc"])
        uri (str (name scheme) "://" host ":" port path)]
    (log/debug {::connection-uri uri})
    uri))

(defn- json-rpc-provider [sys core]
  (JsonRpcProvider. (connection-uri sys core)))

(defn- send
  ([provider method]
   (send provider method []))
  ([provider method params]
   (log/debug {::send {:method method :params params}})
   (-> (.send provider method (clj->js params))
       (lib.promise/then
        (fn [x]
          (js->clj x :keywordize-keys true)))
       (lib.promise/catch
        (fn [e]
          (lib.error/from-obj e))))))

(defn authenticate!
  "Authenticate a user against a core. The account is a map that contains
  the public key from the keypair that represents the user's account."
  [sys permissions]
  (let [address (get-in sys [:crypto/wallet :wallet/address])]
    ;; Make an JsonRpc call to oort backend, passing along the user's
    ;; wallet address. Expect a nonce in return, which should be signed
    ;; and returned to prove ownership of provided key and complete
    ;; registration.
    ;;
    ;; Returns a promise.
    (send (json-rpc-provider sys address) "kb_getNonce" [address permissions])))

(defn verify!
  "Send a signed nonce to verify ownership of a keypair as part of the
  authentication flow."
  [sys core nonce signature]
  {:pre [(every? string? [core nonce])]}
  ;; Returns a promise.
  (send (json-rpc-provider sys core) "kb_verifyNonce" [nonce signature]))

(defn rpc-api [sys core]
  {:pre [(string? core)]}
  (send (json-rpc-provider sys core) "rpc.discover"))

(defn call-rpc-method [sys core method args]
  {:pre [(string? core) (string? method) (vector? args)]}
  (send (json-rpc-provider sys core) method args))
