(ns com.kubelt.spec
  (:require
   [malli.core :as m]
   [com.kubelt.lib.error :as lib.error]))

(defmacro conform [spec data & body]
  `(if (m/validate ~spec ~data)
     (do ~@body)
     (lib.error/explain ~spec ~data :kubelt.type/spec-error)))
