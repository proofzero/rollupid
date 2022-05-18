(ns com.kubelt.rpc.schema.validate
  "Validate an OpenRPC schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))


;; TODO make this fn private
(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [f (fn [a x])]
    ;; TODO walk the schema and collect a set of all the refs that are
    ;; found.
    (reduce f #{} schema)))

;; TODO make fn private
(defn missing-refs
  "Find all $ref and look them up to confirm that they're provided in the
  schema. Return a vector of just the missing refs."
  [schema]
  (let [ref-set (refs schema)]
    ;; TODO look up each ref to confirm that it exists
    ;; TODO return only the missing items
    #{}))

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
  (let [missing (missing-refs schema)]
    (if-not (empty? missing)
      (lib.error/error {:message "missing $refs" :missing missing})
      schema)))
