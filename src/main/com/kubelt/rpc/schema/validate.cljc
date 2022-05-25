(ns com.kubelt.rpc.schema.validate
  "Validate an OpenRPC schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.zip :as zip])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.rpc.schema.util :as rpc.schema.util]
   [com.kubelt.rpc.schema.zip :as rpc.schema.zip]))


(defn- collect-ref
  "Extract the ref at the given location and add it to the provided set,
  returning the set."
  [loc ref-set]
  (let [node (zip/node loc)
        $ref (:$ref node)]
    (conj ref-set $ref)))

(defn- refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (loop [loc (rpc.schema.zip/schema-zip schema)
         ref-set #{}]
    (if (zip/end? loc)
      ref-set
      (recur (zip/next loc) (if (rpc.schema.zip/ref-loc? loc)
                              (collect-ref loc ref-set)
                              ref-set)))))

(defn- missing-refs
  "Find all $ref and look them up to confirm that they're provided in the
  schema. Return a set of just the missing refs."
  [schema]
  (let [ref-set (refs schema)]
    (reduce (fn [ref-set $ref]
              (if-not (rpc.schema.util/lookup $ref schema)
                (conj ref-set $ref)
                ref-set))
            #{}
            ref-set)))

;; validate
;; -----------------------------------------------------------------------------

;; Error checking
;; - check that all referenced ($ref) values exist
(defn validate
  "Check that the schema is well-formed as well as being syntactically
  valid. Returns the unmodified schema if no issues were detected, or an
  error map describing any issues that were found."
  [schema]
  ;; TODO use guards
  (let [missing-set (missing-refs schema)]
    (if-not (empty? missing-set)
      (lib.error/error "missing $refs" {:missing missing-set})
      schema)))
