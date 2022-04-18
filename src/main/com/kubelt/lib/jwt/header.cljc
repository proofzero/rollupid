(ns com.kubelt.lib.jwt.header
  "Header-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; missing
;; -----------------------------------------------------------------------------

(defn missing
  [field detail]
  {:pre [(keyword? field) (map? detail)]}
  (let [path (conj [:header] field)]
    (lib.error/error
     (merge detail {:message "missing header" :missing path}))))

;; failed
;; -----------------------------------------------------------------------------

(defn failed
  [field message detail]
  {:pre [(keyword? field) (string? message) (map? detail)]}
  (let [path (conj [:header] field)]
    (lib.error/error
     (merge detail {:message message :failed path}))))
