(ns com.kubelt.ddt.util
  "Misc utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
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
