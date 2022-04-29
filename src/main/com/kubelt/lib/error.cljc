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

;; error?
;; -----------------------------------------------------------------------------

(defn error?
  "Is the given value a Kubelt error map?"
  [x]
  (and
   (map? x)
   (= :kubelt.type/error (get x :com.kubelt/type))))

;; error
;; -----------------------------------------------------------------------------

(defn error
  "Return a Kubelt error map wrapping the given error."
  [e]
  {:com.kubelt/type :kubelt.type/error
   :error e})

;; explain
;; -----------------------------------------------------------------------------

(defn explain
  "Return human-friendly description of why some value doesn't conform to
  the provided schema."
  [schema value]
  (let [explain (-> schema (mc/explain value) me/humanize)]
    (merge
     {:com.kubelt/type :kubelt.type/error}
     (when (:title (mc/properties schema))
       {:title (:title (mc/properties schema))})
     {:error explain})))

;; conform
;; -----------------------------------------------------------------------------

(defmacro conform
  "Check that data conforms to the given spec, and execute the supplied
  body when it does. Otherwise, return an error map that explains the
  issue(s) that were detected in the data."
  [spec data & body]
  `(if-not (mc/validate ~spec ~data)
     (explain ~spec ~data)
     (do ~@body)))

;; conform*
;; -----------------------------------------------------------------------------
;; For example:
;; (conform* [spec.rpc/path [:eth :sync]] [spec.rpc/path [:web-3 :sha-3]] :foo)

(let [validate-if (fn [spec data body]
                    `(if-not (mc/validate ~spec ~data)
                       (explain ~spec ~data)
                       ~body))]
  ;; TODO write some tests
  ;; TODO remove duplicate guard pairs
  ;; TODO check required number and type of arguments (malli?)
  (defmacro conform*
    "Check that pairs of specs and data are all valid, and if all data
  matches the provided specs then execute the provided body. Otherwise,
  an error is returned that describes the errors found in the first data
  that failed validation."
    [& args]
    (loop [guards (butlast args)
           body (last args)]
      (if (empty? guards)
        body
        (let [[spec data] (first guards)]
          (recur (rest guards) (validate-if spec data body)))))))

(comment
  (require '[com.kubelt.spec.rpc :as spec.rpc])
  (conform* [spec.rpc/path [:eth :sync]] [spec.rpc/path [:web-3 :sha-3]] :foo)
  (conform* [spec.rpc/path [:eth :sync]] [spec.rpc/path [:web-3 :sha-3]] (+ 1 2)))

;; from-obj
;; -----------------------------------------------------------------------------

#?(:cljs
  (defn from-obj
    "Return an error map from a js/Error object."
    [o]
    (let [message (.-message o)]
      (error message))))
