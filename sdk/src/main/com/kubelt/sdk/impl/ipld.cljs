(ns com.kubelt.sdk.impl.ipld
  "IPLD-related data and utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Codecs
;; -----------------------------------------------------------------------------

(def codec-cbor
  :ipld.codec/cbor)

(def codec-json
  :ipld.codec/json)

(def codec-raw
  :ipld.codec/raw)

(def supported-codecs
  #{codec-cbor
    codec-json
    codec-raw})

(def default-codec
  codec-cbor)

(defn codec?
  "Return true if given a keyword representing a supported IPLD codec
  type, and false otherwise."
  [x]
  (and
   (keyword? x)
   (some #{x} supported-codecs)))

;; Hashes
;; -----------------------------------------------------------------------------

(def hash-blake3-256
  :ipld.hash/blake3-256)

(def hash-sha2-256
  :ipld.hash/sha2-256)

(def supported-hashes
  #{hash-blake3-256
    hash-sha2-256})

(def default-hash
  hash-sha2-256)

(defn hash?
  "Return true if given a keyword representing a supported IPLD hash type,
  and false otherwise."
  [x]
  (and
   (keyword? x)
   (some #{x} supported-hashes)))
