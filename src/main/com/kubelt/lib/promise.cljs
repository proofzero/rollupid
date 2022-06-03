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
  "Returns a promise that resolves after the given millisecond interval."
  [ms]
  (promise (fn [resolve _]
             (js/setTimeout resolve ms))))

(defn any
  "Takes an iterable of promises and returns a single promise that
  resolves as soon as any of the promises in the iterable fulfills, with
  the value of the fulfilled promise."
  [coll]
  (p/any coll))

(defn all
  "Takes an iterable of promises and returns a single promise that
  resolves to an array of the results of the input promises."
  [coll]
  (p/all coll))
