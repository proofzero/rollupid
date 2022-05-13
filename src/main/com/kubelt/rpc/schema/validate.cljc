(ns com.kubelt.rpc.schema.validate
  "Validate an OpenRPC schema."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.set :as cset]
   [clojure.walk :as walk])
  (:require
   [com.rpl.specter :as sp])
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; Development
;; -----------------------------------------------------------------------------

(comment
  ;; TODO :params
  (defn params->schema
    [{:keys [params] :as method}]
    (let [params []]
      (-> method
          (assoc :params params)
          (cset/rename-keys {:name :param/name
                             :description :param/description
                             :schema :param/schema}))))

  ;; TODO :result
  (defn extract-method
    [m]
    (-> m
        (params->schema)
        (cset/rename-keys {:description :method/description
                           :summary :method/summary
                           :params :method/params
                           :result :method/result
                           :examples :method/examples})))
  )

;; TODO make fn private
#_(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [;; Get all the references used in method parameters.
        param-set (into #{}
                        (sp/select
                         [:methods sp/ALL :params sp/ALL #(get % :$ref) :$ref]
                         schema))
        ;; Get all the references used in method results.
        result-set (into #{}
                         (sp/select
                          [:methods sp/ALL :result :schema #(get % :$ref) :$ref]
                          schema))]
    (cset/union param result)))

;; TODO experiment will query using specter
;; NB probably easiest to use clojure.walk, but specter liable to be useful
;; for more interesting cases later on
#_(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [schema-walker
        (sp/recursive-path
         [k] p
         [(sp/walker k)
          (sp/stay-then-continue
           [(sp/filterer #(not= k (key %)))
            (sp/walker k)
            p])])]
    (sp/select (schema-walker :$ref) {:$ref "xxx" :foo "bar" :biz "baz"})))

;; TODO make this fn private
(defn refs
  "Return a set of all references ($ref) found in the schema."
  [schema]
  (let [f (fn [a x])]
    (reduce f #{} schema)))

;; TODO make fn private
(defn missing-refs
  "Find all $ref and look them up to confirm that they're provided in the
  schema. Return a vector of just the missing refs."
  [schema]
  (let [ref-set (refs schema)]
    ;; TODO convert each ref path to [keywords]
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
