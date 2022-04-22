(ns com.kubelt.lib.error
  "Error-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as mc]
   [malli.error :as me]))

;; TODO define catalog of errors
;; TODO use cognitect.anomalies?
;; TODO examine truss
;; https://github.com/ptaoussanis/truss

;; TODO flesh out error spec in com.kubelt.spec.error

(defn error?
  "Is the given value a Kubelt error map?"
  [x]
  (and
   (map? x)
   (= :kubelt.type/error (get x :com.kubelt/type))))

(defn error
  "Return a Kubelt error map wrapping the given error."
  [e]
  {:com.kubelt/type :kubelt.type/error
   :error e})

(defn explain
  "Return human-friendly description of why some value doesn't conform to
  the provided schema."
  [schema value & [type-error]]
  (let [explain (-> schema (mc/explain value) me/humanize)]
    (merge
     {:com.kubelt/type (or type-error :kubelt.type/error)}
     (when (:title (mc/properties schema))
       {:title (:title (mc/properties schema))})
     {:error explain})))
