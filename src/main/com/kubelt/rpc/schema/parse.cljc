(ns com.kubelt.rpc.schema.parse
  "Parse an OpenRPC schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.rpc.schema.util :as rpc.schema.util]
   [com.kubelt.rpc.schema.expand :as rpc.schema.expand]
   [com.kubelt.rpc.schema.validate :as rpc.schema.validate]
   [com.kubelt.lib.error :as lib.error]))

;; TODO consider malli transformers for JSON to edn transformation

;; TODO make private
(defn schema->version
  [schema]
  {:pre [(map? schema)]}
  (get schema :openrpc))

;; TODO make private
(defn schema->metadata
  [schema]
  {:pre [(map? schema)]}
  (get schema :info))

;; TODO make private
(defn schema->servers
  [schema]
  {:pre [(map? schema)]}
  (get schema :servers []))

;; TODO make private
(defn method->param-names
  "Given a method map, return a vector of keywordized parameter names."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (reduce (fn [a {param-name :name}]
            (let [path (rpc.schema.util/name->path param-name)]
              (conj a path)))
          [] params))

;; TODO make private
(defn schema->methods
  "Extract the method descriptions from an Open RPC schema supplied as
  edn. Note that underscores in the method names are used to namespace
  the methods, i.e. a method named foo_getBar will be mapped
  into [:foo :get-bar]."
  [schema]
  {:pre [(map? schema)]}
  (letfn [(f [m method]
            (let [method-name (get method :name)
                  method-summary (get method :summary)
                  method-params (method->param-names method)
                  path (rpc.schema.util/name->path method-name)
                  method {:method/name method-name
                          :method/summary method-summary
                          :method/params method-params
                          :method/raw method}]
              (assoc m path method)))]
    (let [methods (get schema :methods [])]
      (reduce f {} methods))))

;; parse
;; -----------------------------------------------------------------------------
;; TODO convert result names to kebab keywords
;; e.g. "hashesPerSecond" -> :hashes-per-second
;; - use original string names *and* kebab keywords
;;
;; TODO replace $ref with the referenced values
;; - method > params
;; - method > result
;;
;; TODO use error threading fn (error-> ...) that only threads the value
;; through successive steps as long as the return value isn't an error
;; map.
;;
;; TODO build (error-> ...) on top of (fn-> x (fn [x] ...)). Applies the
;; function to each return result and if return value is true, continues
;; threading. Cf. some->; use lib.error/error? as fn, e.g.
;; (def error-> x lib.error/error?)

(defn parse
  "Given a provider URL and an OpenRPC schema (converted to edn),
  transform the schema into a client map. The options map is the same as
  that provided to the client init function."
  [schema options]
  {:pre [(map? schema) (map? options)]}
  ;; Check for various common errors that may occur in the schema
  ;; definition.
  (if-let [schema (rpc.schema.validate/validate schema)]
    (if (lib.error/error? schema)
      schema
      ;; If no errors are detected, expand the schema, i.e. replace
      ;; internal references to definitions by the definitions
      ;; themselves.
      (if-let [schema (rpc.schema.expand/expand schema)]
        (let [rpc-version (schema->version schema)
              rpc-metadata (schema->metadata schema)
              rpc-servers (schema->servers schema)
              ;; Generate a map from "path" (a vector of keywords
              ;; representing an available RPC call) to a descriptive
              ;; map.
              rpc-methods (schema->methods schema)]
          {:rpc/version rpc-version
           :rpc/metadata rpc-metadata
           :rpc/servers rpc-servers
           :rpc/methods rpc-methods})))))
