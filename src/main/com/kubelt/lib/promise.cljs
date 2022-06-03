(ns com.kubelt.lib.promise
  "Promise-related utilities. These are mix of wrappers around Google
  Clojure promise-related functions and core.async promise-related
  functions; some has been directly cadged (with slight modification)
  from jamesmacaulay/cljs-promises."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [promesa.core :as p]
   [goog.async.promises :refer [allMapValues]]))

;; TODO support goog.Promise, which is the same as a native promise but
;; can also be cancelled.

;; Internal
;; -----------------------------------------------------------------------------

#_(defn- cast-as-array
  [coll]
  (if (or (array? coll)
          (not (reduceable? coll)))
    coll
    (into-array coll)))

;; Public
;; -----------------------------------------------------------------------------

(defn promise?
  "Returns true if the argument is a JavaScript promise, and false
  otherwise."
  [x]
  (p/promise? x))

(defn promise
  "Return a promise that uses the given resolver function. This function
  must accept two arguments, a function that may be called to resolve
  the promise, and a second function that may be called to reject the
  promise."
  [resolver]
  {:pre [(fn? resolver)]}
  (p/create resolver))

(defn then
  [promise on-fulfilled]
  {:pre [(fn? on-fulfilled)]}
  (p/then promise on-fulfilled)
  #_([promise on-fulfilled on-rejected]
     {:pre [(every? fn? [on-fulfilled on-rejected])]}
     (p/then promise on-fulfilled)
     (.then promise on-fulfilled on-rejected)))

(defn catch
  [promise on-rejected]
  {:pre [(fn? on-rejected)]}
  (p/catch promise on-rejected))

(defn finally
  [promise on-final]
  {:pre [(fn? on-final)]}
  (p/finally promise on-final))

(defn resolved
  "Return a promise that resolves to the given value."
  [x]
  (p/promise x))

(defn rejected
  "Return a promise that rejects to the given value."
  [x]
  (p/rejected x))

(defn timeout
  "Returns a promise that resolves after the given millisecond interval."
  [ms]
  (promise (fn [resolve _]
             (js/setTimeout resolve ms))))

;; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any
#_(defn any
  "Takes an iterable of promises and returns a single promise that
  resolves as soon as any of the promises in the iterable fulfills, with
  the value of the fulfilled promise."
  [coll]
  (.any js/Promise (cast-as-array coll)))

;; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
(defn all
  "Takes an iterable of promises and returns a single promise that
  resolves to an array of the results of the input promises."
  [coll]
  (p/all coll))

;; Google Clojure library promise utilities:
;;   https://google.github.io/closure-library/api/goog.async.promises.html
;; JavaScript native Maps:
;;   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
#_(defn all-map
  "Resolves when all promise values in the map resolve. The resolved value
  will be a map with the same keys as the input map, but with the
  resolved values of the promises. Rejects with first error if any
  promise rejects. Like Promise.all() but for Maps."
  [js-map]
  {:pre [(= js/Map (type js-map))] :post [(promise? %)]}
  (allMapValues js-map))

;; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
#_(defn all-settled
  "Returns a promise that resolves after all of the given promises have
  either fulfilled or rejected, with an array of objects that each
  describes the outcome of each promise."
  [coll]
  (.allSettled js/Promise (cast-as-array coll)))

#_(defmacro async
  "Rename the core.async go function to improve familiarity."
  [body]
  (go ~body))

#_(defn await
  "Takes a value from a promise. Must be called inside a go block. Parks
  while the promise remains unresolved."
  [x]
  {:pre [(promise? x)]}
  (<p! x))
