(ns com.kubelt.rpc.client
  "RPC client utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.spec.rpc.client :as spec.rpc.client]))

;; client?
;; -----------------------------------------------------------------------------

(defn client?
  "Returns true if the argument has the expected shape of an RPC client,
  and false otherwise."
  [x]
  (malli/validate spec.rpc.client/client x))

;; init
;; -----------------------------------------------------------------------------

(defn init
  "Initialize an RPC client."
  [http-client options]
  {:com.kubelt/type :kubelt.type/rpc.client
   :init/options options
   :http/client http-client
   :rpc/servers {}
   :rpc/schemas {}})

;; find-method
;; -----------------------------------------------------------------------------

(defn find-method
  "Look up the method associated with a path in the client."
  [client path]
  ;; Does unaltered path exist in default schema? If so, return the
  ;; corresponding method, and otherwise look for the path in the
  ;; schemas that are prefixed.
  (let [lookup-path
        (fn [client prefix path]
          (get-in client [:rpc/schemas prefix :rpc/methods path]))]
    (if-let [method (lookup-path client ::rpc.schema/default path)]
      method
      (let [prefix (first path)
            path (vec (rest path))]
        (lookup-path client prefix path)))))
