(ns com.kubelt.lib.p2p
  "Wrapper around the external p2p naming system."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   ["@ethersproject/providers" :refer [JsonRpcProvider]]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :as lib.promise]))

;; TODO .cljc

(defn- connection-uri [sys core]
  (let [scheme (get-in sys [:client/p2p :http/scheme])
        host (get-in sys [:client/p2p :http/host])
        port (get-in sys [:client/p2p :http/port])
        path (cstr/join "" ["/@" core "/jsonrpc"])]
    (str (name scheme) "://" host ":" port path)))

(defn authenticate!
  "Authenticate a user against a core. The account is a map that contains the public
  key from the keypair that represents the user's account."
  [sys core]
  {:pre [(string? core)]}
  (let [address (get-in sys [:crypto/wallet :wallet/address])
        rpc-provider (JsonRpcProvider. (connection-uri sys core))]
    ;; Make an JsonRpc call to p2p system, passing along the user's
    ;; wallet address. Expect a nonce in return, which should be signed
    ;; and returned to prove ownership of provided key and complete
    ;; registration.
    ;;
    ;; Returns a promise.
    (-> (.send rpc-provider "kb_auth" #js [address])
        (lib.promise/catch
         (fn [e]
           (lib.error/from-obj e))))))

(defn verify!
  "Send a signed nonce to verify ownership of a keypair as part of the
  authentication flow."
  [sys core nonce signature]
  {:pre [(every? string? [core nonce])]}
  ;; Returns a promise.
  (let [rpc-provider (JsonRpcProvider. (connection-uri sys core))]
    (-> (.send rpc-provider "kb_auth_verify" #js [nonce signature])
        (lib.promise/catch
         (fn [e]
           (lib.error/from-obj e))))))
