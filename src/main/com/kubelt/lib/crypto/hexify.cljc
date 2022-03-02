(ns com.kubelt.lib.crypto.hexify
  "Generate hex strings from byte data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [org.bouncycastle.util.encoders Hex]))
  #?(:cljs
     (:require
      ["@stablelib/hex" :as hex]))
  (:require
   [com.kubelt.lib.octet :as lib.octet]))


(defn hex-string
  [byte-data]
  (let [byte-data (lib.octet/as-bytes byte-data)]
    #?(:clj
       (Hex/toHexString byte-data)
       :cljs
       (let [lower-case? true]
         (.encode hex byte-data lower-case?)))))

(defn str->bytes
  "Convert a string into a byte array. In Clojure this is a [B, while in
  ClojureScript it returns a Uint8Array."
  [s]
     (let [text-encoder (js/TextEncoder.)]
             (.encode text-encoder s)))

;; TODO conditionally handle strings if necessary
#_(if (string? byte-data)
    (js/Uint8Array.from (.split byte-data ""))
    (js/Uint8Array.from byte-data))
