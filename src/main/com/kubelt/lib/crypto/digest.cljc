(ns com.kubelt.lib.crypto.digest
  "Compute hash digests."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [java.security MessageDigest]
      [org.bouncycastle.crypto.digests
       Blake3Digest
       KeccakDigest
       SHA256Digest
       SHA3Digest])
     :cljs
     (:require
      ["@stablelib/sha256" :as sha256]
      ["@stablelib/sha3" :as sha3]))
  (:require
   [com.kubelt.lib.crypto.hexify :as lib.hexify]
   [com.kubelt.lib.octet :as lib.octet]))

;; There are more digest algorithms supported in BouncyCastle that may
;; be of interest, including:
;; - SHA384Digest
;; - SHA512Digest
;; - SHAKEDigest
;; - TigerDigest
;; - WhirlpoolDigest

;; There are crypto algorithms supported in the ClojureScript "standard
;; library":
;; - goog.crypt.Aes
;; - goog.crypt.Arc4
;; - goog.crypt.Cbc
;; - goog.crypt.Hmac
;; - goog.crypt.Sha256

;; Internal
;; -----------------------------------------------------------------------------

(defn- digest-map
  "Takes some digest bytes and a map describing the digest, and returns a
  standard digest map."
  [digest-bytes desc-map]
  (let [hex-string (lib.hexify/hex-string digest-bytes)]
    (merge desc-map
           {:com.kubelt/type :kubelt.type/crypto.digest
            :digest/bytes digest-bytes
            :digest/hex-string hex-string})))

(defn- compute-digest
  "Invoke the passed-in hash digest implementation to compute the hash of
  some data. The description map describes the algorithm being passed in."
  [digest description data-bytes]
  {:pre [(map? description)]}
  #?(:clj
     ;; Wrap the invocation of a BouncyCastle digest.
     (let [offset 0
           data-length (alength data-bytes)]
       ;; Compute the digest of all the passed in bytes.
       (.update digest data-bytes offset data-length)
       (let [;; Final hash bytes written into this byte array.
             digest-bytes (byte-array (.getDigestSize digest))
             byte-count (.doFinal digest digest-bytes 0)]
         (digest-map digest-bytes description)))
     :cljs
     ;; Wrap the invocation of a StableLib digest.
     (do
       (.update digest data-bytes)
       (let [digest-bytes (.digest digest)]
         (digest-map digest-bytes description)))))

;; Public
;; -----------------------------------------------------------------------------

#_(defn blake3
  "Compute the Blake3 digest of some data."
  [data]
  (let [description {:digest/algorithm :digest.algorithm/blake3
                     :digest/byte-length 32
                     :digest/bit-length 256}]
    #?(:clj
       (let [digest (Blake3Digest.)]
         (compute-digest digest description data))
       :cljs
       ;; TODO waiting for StableLib implementation of Blake3.
       :not-yet-implemented)))

(defn sha2-256
  "Compute the SHA2-256 digest of some data."
  [data]
  (let [description {:digest/algorithm :digest.algorithm/sha2-256
                     :digest/byte-length 32
                     :digest/bit-length 256}
        digest #?(:clj (SHA256Digest.)
                  :cljs (sha256/SHA256.))
        data-bytes (lib.octet/as-bytes data)]
    (compute-digest digest description data-bytes)))

(defn sha3-256
  "Compute the SHA3-256 (Keccak) digest of some data."
  [data]
  (let [description {:digest/algorithm :digest.algorithm/sha3-256
                     :digest/byte-length 32
                     :digest/bit-length 256}
        digest #?(:clj (SHA3Digest.)
                  :cljs (sha3/SHA3256.))
        data-bytes (lib.octet/as-bytes data)]
    (compute-digest digest description data-bytes)))
