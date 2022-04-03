(ns com.kubelt.lib.base64
  "Base64 encoding and decoding."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  #?(:clj
     (:import
      [java.util Base64]))
  #?(:cljs
     (:require
      [goog.crypt.base64 :as base64])))

;; goog.crypto.base64
;; (.encodeString base64 input alphabet) => string
;; (.encodeByteArray base64 input alphabet) => string
;; (.decodeString base64 input) => string
;; (.decodeStringToByteArray base64 input) => Array<number>
;; (.decodeStringToUint8Array base64 input) => Uint8Array

;; JVM
;; (Base64/getDecoder)
;; => Base64.Decoder
;; (.decode b64-decoder byte[])
;; (.decode b64-decoder ByteBuffer)
;; (.decode b64-decoder String)

(defn encode
  "Encode some data using base64 encoding (with a URL-safe
  alphabet). Returns a string."
  [x]
  #?(:clj
     (let [b64-encoder (Base64/getUrlEncoder)
           data (if-not (bytes? x) (.getBytes x) x)]
       (.encodeToString b64-encoder data))
     :cljs
     (cond
       ;; string
       (string? x)
       (base64/encodeString x base64/BASE_64_URL_SAFE)
       ;; uint8array
       (= (.. x -constructor -name) "Uint8Array")
       (base64/encodeByteArray x base64/BASE_64_URL_SAFE))))

(defn decode-string
  [s]
  #?(:clj
     (let [b64-decoder (Base64/getUrlDecoder)]
       (String. (.decode b64-decoder s)))
     :cljs
     (base64/decodeString s)))

(defn decode-bytes
  [s]
  #?(:clj
     (let [b64-decoder (Base64/getUrlDecoder)]
       (bytes (.decode b64-decoder s)))
     :cljs
     (base64/decodeStringToUint8Array s)))
