(ns com.kubelt.spec
  "Data specifications for SDK elements."
  {:copyright "©2022 Proof Zero Inc" :license "Apache 2.0"}
  (:require
   [malli.core :as m])
  (:require
   [com.kubelt.lib.error :as lib.error]))

(defmacro conform
  [spec data & body]
  `(if (m/validate ~spec ~data)
     (do ~@body)
     (lib.error/explain ~spec ~data)))
