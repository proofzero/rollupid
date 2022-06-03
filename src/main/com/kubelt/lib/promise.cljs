(ns com.kubelt.lib.promise
  "Promise-related utilities. Wrapper around funcool/promesa lib"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require [promesa.core :as p]))

;; TODO support goog.Promise, which is the same as a native promise but
;; can also be cancelled.

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
  (p/then promise on-fulfilled))

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
  "Returns a cancellable promise that will be fulfilled with this
  promise's fulfillment value or rejection reason.  However, if this
  promise is not fulfilled or rejected within `ms` milliseconds, the
  returned promise is cancelled with a TimeoutError"
  [p ms]
  (p/timeout p ms))

(defn delay
  "Given a timeout in miliseconds and optional value, returns a promise
  that will fulfilled with provided value (or nil) after the time is
  reached."
  [ms]
  (p/delay ms))

(defn any
  "Given an array of promises, return a promise that is fulfilled when
  first one item in the array is fulfilled."
  [coll]
  (p/any coll))

(defn all
  "Given an array of promises, return a promise
  that is fulfilled  when all the items in the
  array are fulfilled.

  Example:

  (-> (all [(promise :first-promise)
            (promise :second-promise)]
      (then (fn [[first-result second-result]]))
       (println (str first-result \", \" second-result)

  Will print out
  :first-promise, :second-promise.

  If at least one of the promises is rejected, the resulting promise will be
  rejected."
  [coll]
  (p/all coll))
