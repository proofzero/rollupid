(ns com.kubelt.rpc.schema.parse
  "Parse an OpenRPC schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.rpc.schema.expand :as rpc.schema.expand]
   [com.kubelt.rpc.schema.util :as rpc.schema.util]
   [com.kubelt.rpc.schema.validate :as rpc.schema.validate]))

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
(defn params-all
  "Given a method map, return a vector of all parameter names after
  keywordization."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (reduce (fn [a {param-name :name}]
            (let [param-kw (rpc.schema.util/s->kw param-name)]
              (conj a param-kw)))
          [] params))

(defn param-required?
  "Given a map describing a parameter, return true if the parameter is
  marked as being required, and false if the parameter is optional. A
  required parameter is one that has the :required key with a value of
  true. By default parameters are not required."
  [param]
  (= true (get param :required false)))

(defn params-required
  "Given a method map, return a vector of keywordized parameter names for
  just those parameters that are required."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (reduce (fn [a {param-name :name :as param}]
            (if (param-required? param)
              (conj a (rpc.schema.util/s->kw param-name))
              a))
          [] params))

(defn params-optional
  "Given a method map, return a vector of keywordized parameter names for
  just those parameters that are optional."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (reduce (fn [a {param-name :name :as param}]
            (if-not (param-required? param)
              (conj a (rpc.schema.util/s->kw param-name))
              a))
          [] params))

(defn method->params
  "Given a method map, return a map of the parameters of the RPC call. The
  keys of the map are keywordized versions of the string parameter name,
  and the values are maps describing the parameter."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (reduce (fn [m {param-name :name :as param}]
            (let [param-kw (rpc.schema.util/s->kw param-name)]
              (assoc m param-kw param)))
          {}
          params))

(defn method->schemas
  "Given a method, return a map from keywordized parameter name to the
  schema that may be used to validate the values supplied for that
  parameter."
  [{:keys [params] :as method}]
  {:pre [(map? method)]}
  (into {} (map (fn [{param-name :name schema :schema}]
                  (let [param-kw (rpc.schema.util/s->kw param-name)]
                    ;; TODO translate schema into malli. For now we just
                    ;; return the supplied JSON Schema.
                    [param-kw schema]))
                params)))

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
                  params-all-kw (params-all method)
                  params-req-kw (params-required method)
                  params-opt-kw (params-optional method)
                  params (method->params method)
                  schemas (method->schemas method)
                  ;; result
                  path (rpc.schema.util/name->path method-name)
                  method {:method/name method-name
                          :method/summary method-summary
                          :method/params params
                          :method.params/all params-all-kw
                          :method.params/required params-req-kw
                          :method.params/optional params-opt-kw
                          :method.params/schemas schemas
                          ;; Include this to see the original schema
                          ;; definition of the method.
                          ;;:method/raw method
                          }]
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
      (let [schema (rpc.schema.expand/expand schema)
            rpc-version (schema->version schema)
            rpc-metadata (schema->metadata schema)
            rpc-servers (schema->servers schema)
            ;; Generate a map from "path" (a vector of keywords
            ;; representing an available RPC call) to a descriptive
            ;; map.
            rpc-methods (schema->methods schema)]
        {:rpc/version rpc-version
         :rpc/metadata rpc-metadata
         :rpc/servers rpc-servers
         :rpc/methods rpc-methods}))
    (lib.error/error "unable to validate schema")))
