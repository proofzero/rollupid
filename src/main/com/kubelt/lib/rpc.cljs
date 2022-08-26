(ns com.kubelt.lib.rpc
  "Play with RPC."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.oort :as lib.oort]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]))

(defn rpc-call&
  "Make an RPC call, returning a promise that resolves to the result of
  the request. This is a convenience function that allows for arbitrary
  RPC calls to be performed, rather than keeping RPC encapsulated within
  the SDK. Try not to rely on it, it may go away some day."
  [sys api args]
  (lib.promise/promise
   (fn [resolve reject]
     (let [wallet-address (get-in sys [:crypto/wallet :wallet/address])
           client (-> {:uri/domain (-> sys :client/oort :http/host)
                       :uri/port (-> sys :client/oort :http/port)
                       :uri/scheme (-> sys :client/oort :http/scheme)
                       :uri/path (cstr/join "" ["/" wallet-address "/jsonrpc"])
                       :http/client (:client/http sys)
                       :rpc/jwt (get-in sys [:crypto/session :vault/tokens* wallet-address])}
                      rpc/init
                      (rpc.schema/schema api))
           method (:method args)
           params (or (:params args) {})
           request (rpc/prepare client method params)
           rpc-method (:method/name (:rpc/method request))
           rpc-params (:rpc/params request)
           rpc-args (into [] (vals rpc-params))
           rpc-query {}]
       (if (:rpc-client-type args)
         (-> (lib.oort/call-rpc-method sys wallet-address rpc-method rpc-args rpc-query)
             (lib.promise/then resolve)
             (lib.promise/catch reject))
         (-> (rpc/execute client request)
             (lib.promise/then resolve)
             (lib.promise/catch reject)))))))

(defn call-rpc-with-api-js
  "Make an RPC call from a JS context, returning a promise that resolves
  to the result of the request. This is a convenience function that
  allows for arbitrary RPC calls to be performed, rather than keeping
  RPC encapsulated within the SDK. Try not to rely on it, it may go away
  some day."
  [sys api args]
  (let [core (-> (get-in sys [:crypto/session :vault/tokens]) keys first)]
    (-> (assoc sys :crypto/wallet {:wallet/address core})
        (rpc-call& api (update (js->clj args :keywordize-keys true) :method #(mapv keyword %)))
        (lib.promise/then clj->js))))
