(ns com.kubelt.lib.crypto.digest
  "Compute hash digests."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [java.security MessageDigest]
      [org.bouncycastle.util.encoders Hex]
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
   [com.kubelt.lib.crypto.hexify :as lib.hexify]))

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

(defn- compute-digest
  "Invoke the passed-in hash digest implementation to compute the hash of
  some data."
  [digest data]
  #?(:clj
     ;; Wrap the invocation of a BouncyCastle digest.
     (let [offset 0
           data-bytes (.getBytes data)
           data-length (alength data-bytes)]
       ;; Compute the digest of all the passed in bytes.
       (.update digest data-bytes offset data-length)
       (let [;; Final hash bytes written into this byte array.
             result (byte-array (.getDigestSize digest))
             digest-bytes (.doFinal digest result 0)]
         (lib.hexify/hex-string result)))
     :cljs
     ;; Wrap the invocation of a StableLib digest.
     ;; TODO Convert data to Uint8Array
     (let []
       (.update digest data)
       (let [;; Returns a Uint8Array.
             result (.digest digest)]
         ;; FIXME Ensure works for browser also.
         (lib.hexify/hex-string result)))))

;; Public
;; -----------------------------------------------------------------------------

#_(defn blake3
  "Compute the Blake3 digest of some data."
  [data]
  #?(:clj
     (let [digest (Blake3Digest.)]
       (compute-digest digest data))
     :cljs
     ;; TODO waiting for StableLib implementation of Blake3.
     :not-yet-implemented))

(defn sha2-256
  "Compute the SHA2-256 digest of some data."
  [data]
  #?(:clj
     (let [digest (SHA256Digest.)]
       (compute-digest digest data))
     :cljs
     (let [digest (sha256/SHA256.)]
       (compute-digest digest data))))

(defn sha3-256
  "Compute the SHA3-256 (Keccak) digest of some data."
  [data]
  #?(:clj
     (let [digest (SHA3Digest.)]
       (compute-digest digest data))
     :cljs
     (let [digest (sha3/SHA3256.)]
       (compute-digest digest data))))
