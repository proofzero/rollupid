(ns com.kubelt.lib.uuid
  "UUID utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [java.util UUID])
     :cljs
     (:require
      ["@stablelib/uuid" :as uuid])))

;; Public
;; -----------------------------------------------------------------------------

(defn random
  []
  #?(:clj (str (UUID/randomUUID))
     :cljs (.uuid uuid)))
