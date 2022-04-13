(ns com.kubelt.lib.crypto.seed
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]
   [com.kubelt.lib.uuid :as lib.uuid]))


(defn- seed->map
  [passphrase]
  {:pre [(string? passphrase)]}
  (let [digest (lib.digest/sha3-256 passphrase)
        data-bytes (get digest :digest/bytes)
        hex-string (get digest :digest/hex-string)]
    (merge
     (select-keys digest [:digest/algorithm
                          :digest/byte-length
                          :digest/bit-length])
     {:com.kubelt/type :kubelt.type/crypto.seed
      :seed/bytes data-bytes
      :seed/hex-string hex-string})))

(defn- random-passphrase
  []
  (lib.uuid/random))

;; Public
;; -----------------------------------------------------------------------------

(defn seed?
  [x]
  (and
   (map? x)
   (= :kubelt.type/crypto.seed (get x :com.kubelt/type))))

(defn random
  "Return a random seed."
  []
  (let [passphrase (random-passphrase)]
    (seed->map passphrase)))

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
