(ns com.kubelt.lib.jwt.header
  "Header-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; missing
;; -----------------------------------------------------------------------------

(defn missing
  [field detail]
  {:pre [(keyword? field)
         (map? detail)
         (not (some #{:error/message :header/missing} (keys detail)))]}
  (let [path (conj [:header] field)]
    (lib.error/error
     (merge detail {:error/message "missing header"
                    :header/missing path}))))

;; failed
;; -----------------------------------------------------------------------------

(defn failed
  [field detail]
  {:pre [(keyword? field)
         (map? detail)
         (not (some #{:error/message :header/failed} (keys detail)))]}
  (let [path (conj [:header] field)]
    (lib.error/error
     (merge detail {:error/message "failed header"
                    :header/failed path}))))
