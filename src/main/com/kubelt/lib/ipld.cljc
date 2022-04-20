(ns com.kubelt.lib.ipld
  "IPLD-related data and utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

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

;; Hashers
;; -----------------------------------------------------------------------------

(def hasher-blake3-256
  :ipld.hasher/blake3-256)

(def hasher-sha2-256
  :ipld.hasher/sha2-256)

(def supported-hashers
  #{hasher-blake3-256
    hasher-sha2-256})

(def default-hasher
  hasher-sha2-256)

(defn hasher?
  "Return true if given a keyword representing a supported IPLD hash type,
  and false otherwise."
  [x]
  (and
   (keyword? x)
   (some #{x} supported-hashers)))
