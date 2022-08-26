(ns com.kubelt.lib.oort
  "Wrapper around the Oort backend."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   ["@ethersproject/providers" :refer [JsonRpcProvider]])
  (:require
   [camel-snake-kebab.core :as csk]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :as lib.promise]))

;; TODO .cljc
;; TODO use a URI library (external, or lib.http)

(defn- connection-uri
  "Returns the oort URI for a given core and environment as a string."
  ([sys core]
   (let [query-params {}]
     (connection-uri sys core query-params)))

  ([sys core query-params]
   (let [scheme (get-in sys [:client/oort :http/scheme])
         host (get-in sys [:client/oort :http/host])
         port (get-in sys [:client/oort :http/port])
         path (cstr/join "" ["/" core "/jsonrpc"])
         query-str (cstr/join "&" (map (fn [[k v]] (str k "=" v)) query-params))
         uri (str (name scheme) "://" host ":" port path)
         uri (if-not (cstr/blank? query-str)
               (str uri "?" query-str)
               uri)]
     (log/debug {::connection-uri uri})
     uri)))

(defn- json-rpc-provider
  ([sys core]
   (let [query-params {}]
     (json-rpc-provider sys core query-params)))

  ([sys core query-params]
   (JsonRpcProvider. (connection-uri sys core query-params))))

(defn- send
  "Send an RPC request using the given provider and API method. When
  params are provided (as a vector) they are injected into the RPC call
  as the call parameters. When the query map is supplied its key/value
  pairs are used as query parameters into the URL to which the request
  is made."
  ([provider method]
   (let [params []]
     (send provider method params)))

  ([provider method params]
   {:pre [(string? method) (vector? params)]}
   (log/debug {::send {:method method :params params}})
   (-> (.send provider method (clj->js params))
       (lib.promise/then
        (fn [x]
          (js->clj x :keywordize-keys true)))
       (lib.promise/catch
        (fn [e]
          (lib.error/from-obj e))))))

;; TODO rename to lib.oort/discover
(defn rpc-api
  "Perform an RPC discovery request to obtain a description of the
  supported methods on the provider."
  [sys core]
  {:pre [(string? core)]}
  (let [;; The chain/id doesn't matter for discovery.
        query {}
        provider (json-rpc-provider sys core query)]
    (send provider "rpc.discover")))

(defn call-rpc-method
  [sys core method args query]
  {:pre [(string? core) (string? method) (vector? args) (map? query)]}
  (let [provider (json-rpc-provider sys core query)]
    (send provider method args)))

;; Public
;; -----------------------------------------------------------------------------

(defn authenticate&
  "Authenticate a user against a core. The account is a map that contains
  the public key from the keypair that represents the user's account."
  [sys permissions network]
  {:pre [(map? sys) (map? permissions) (map? network)]}
  (let [address (get-in sys [:crypto/wallet :wallet/address])
        network (update-keys network (fn [k] (-> k name csk/->camelCase)))
        provider (json-rpc-provider sys address)]
    ;; Make an JsonRpc call to oort backend, passing along the user's
    ;; wallet address, permission list, and a blockchain
    ;; specifier (chain name and ID). Expect a nonce in return, which
    ;; should be signed and returned to prove ownership of provided key
    ;; and complete registration.
    ;;
    ;; Returns a promise.
    (send provider "kb_getNonce" [address permissions network])))

(defn verify&
  "Send a signed nonce to verify ownership of a keypair as part of the
  authentication flow."
  [sys core nonce signature]
  {:pre [(every? string? [core nonce])]}
  ;; Returns a promise.
  (send (json-rpc-provider sys core) "kb_verifyNonce" [nonce signature]))
