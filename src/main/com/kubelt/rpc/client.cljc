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

;; from-schema
;; -----------------------------------------------------------------------------
;; TODO convert result names to kebab keywords
;; e.g. "hashesPerSecond" -> :hashes-per-second
;; - use original string names *and* kebab keywords
;;
;; TODO replace $ref with the referenced values
;; - method > params
;; - method > result

(defn from-schema
  "Given a provider URL and an OpenRPC schema (converted to edn),
  transform the schema into a client map. The options map is the same as
  that provided to the client init function."
  [schema options]
  {:pre [(map? schema) (map? options)]}
  (let [version (rpc.schema/version schema)
        metadata (rpc.schema/metadata schema)
        servers (rpc.schema/servers schema)
        ;; Generate a map from "path" (a vector of keywords representing
        ;; an available RPC call) to a descriptive map.
        methods (rpc.schema/methods schema)]
    {:com.kubelt/type :kubelt.type/rpc.client
     :rpc/options options
     :rpc/version version
     :rpc/metadata metadata
     :rpc/servers servers
     :rpc/methods methods}))
