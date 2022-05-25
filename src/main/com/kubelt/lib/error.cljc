(ns com.kubelt.lib.error
  "Error-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as mc]
   [malli.error :as me])
  (:require
   [com.kubelt.spec.error :as spec.error]))

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
  ([message]
   (error message nil))
  ([message data]
   (error message data nil))
  ([message data cause]
   (cond->
    {:com.kubelt/type :kubelt.type/error
     :error message}
     data (assoc :data data)
     cause (assoc :cause cause))))

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
;; TODO write some tests

(defmacro conform*
  "Check that pairs of specs and data are all valid, and if all data
  matches the provided specs then execute the provided body. Otherwise,
  an error is returned that describes the errors found in the first data
  that failed validation."
  [& args]
  (let [guards# (distinct (butlast args))
        body# (last args)
        check-for (fn [msg# spec# data#]
                    `(when-not (mc/validate ~spec# ~data#)
                      (let [err# (explain ~spec# ~data#)]
                        (throw (ex-info msg# err#)))))]
    ;; Validate that there's at least one guard tuple: [spec data].
    (check-for "invalid guards" spec.error/guards guards#)
    ;; Validate that a body to execute was provided.
    (check-for "invalid body" spec.error/body body#)
    ;; Generate the output form.
    (loop [guards# guards#
           body# body#]
      (if (empty? guards#)
        (do body#)
        (let [[spec# data#] (first guards#)]
          (recur (rest guards#)
                 `(if-not (mc/validate ~spec# ~data#)
                    (explain ~spec# ~data#)
                    ~body#)))))))

(comment
  (require '[com.kubelt.spec.rpc :as spec.rpc])
  (conform* [spec.rpc/path [:eth :sync]] [spec.rpc/path [:web-3 :sha-3]] :foo)
  (conform* [spec.rpc/path [:eth :sync]] [spec.rpc/path [:web-3 :sha-3]] (+ 1 2))

  (require '[com.kubelt.spec.rpc.client :as spec.rpc.client])
  (conform* [spec.rpc.client/client {}] :test)
  (macroexpand '(conform* [spec.rpc.client/client {}] :test))
  )

;; from-obj
;; -----------------------------------------------------------------------------

#?(:cljs
  (defn from-obj
    "Return an error map from a js/Error object."
    [o]
    (let [message (.-message o)]
      (error message))))
