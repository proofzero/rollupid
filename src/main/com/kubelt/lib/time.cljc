(ns com.kubelt.lib.time
  "Time-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [tick.core :as tick]))

;; now
;; -----------------------------------------------------------------------------

(defn now
  "Return the current timestamp."
  []
  (tick/now))

;; unix-time
;; -----------------------------------------------------------------------------

(defn unix-time
  "Return the Unix time, the number of seconds since the epoch."
  []
  ;; (inst-ms) returns milliseconds so divide by 1000 to get seconds.
  (quot (inst-ms (tick/inst (tick/now))) 1000))
