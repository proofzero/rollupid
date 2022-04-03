(ns com.kubelt.lib.uuid
  "UUID utilities."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  #?(:clj
     (:import
      [java.util UUID])
     :cljs
     (:require
      ["@stablelib/uuid" :as stable-uuid])))

;; Public
;; -----------------------------------------------------------------------------

(defn random
  []
  #?(:clj (str (UUID/randomUUID))
     :cljs (.uuid stable-uuid)))
