(ns com.kubelt.ddt.util
  "Misc utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [camel-snake-kebab.core :as csk]
   [clojure.string :as cstr])
  (:require
   ["process" :as process]))

;; Public
;; -----------------------------------------------------------------------------

(defn exit-if
  "If the given error is truthy, print it out and end the program with an
  error result code."
  [err]
  (when err
    (println (str "error: " err))
    (.exit process 1)))

;; rpc-name->path
;; -----------------------------------------------------------------------------

(defn rpc-name->path
  "Given a string composed of a sequence of concatenated keywords, parse
  the string to return a vector of the keywords. E.g. ':foo:bar' will be
  returned as [:foo :bar]."
  [s]
  {:pre [(string? s)]}
  (->> (cstr/split s #":")
       (filter (complement cstr/blank?))
       (mapv csk/->kebab-case-keyword)))
