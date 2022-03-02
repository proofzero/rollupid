(ns com.kubelt.lib.crypto.seed
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]))


(defn- seed->map
  [passphrase]
  (let [digest (lib.digest/sha3-256 passphrase)
        byte-length 32
        data-bytes (get digest :digest/bytes)
        hex-string (get digest :digest/hex-string)]
    (merge
     (select-keys digest [:digest/algorithm
                          :digest/byte-length
                          :digest/bit-length])
     {:com.kubelt/type :kubelt.type/seed
      :seed/bytes data-bytes
      :seed/hex-string hex-string})))

;; Public
;; -----------------------------------------------------------------------------

(defn from-passphrase
  "Return a seed derived from a passphrase. If a signing function is
  provided, it will be used on the derived value and the resulting "
  ([passphrase]
   {:assert [(string? passphrase)]}
   (seed->map passphrase))
  ([passphrase sign-fn]
   {:assert [(string? passphrase) (fn? sign-fn)]}
   (let [seed (from-passphrase passphrase)
         seed-bytes (get seed :seed/bytes)
         signature (sign-fn seed-bytes)]
     (merge seed {:seed/signature signature}))))
