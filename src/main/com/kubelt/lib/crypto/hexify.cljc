(ns com.kubelt.lib.crypto.hexify
  "Generate hex strings from byte data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [org.bouncycastle.util.encoders Hex]))
  #?(:browser
     (:require
      ["@stablelib/hex" :as hex])))

;; TODO browser
(defn hex-string
  [byte-data]
  #?(:clj
     (Hex/toHexString byte-data)
     :browser
     (let [buffer (js/Uint8Array.from byte-data)
           lower-case? true]
       (.encode hex buffer lower-case?))
     :node
     (let [buffer (js/Buffer.from byte-data)]
       (.toString buffer "hex"))))

;; TODO conditionally handle strings if necessary
#_(if (string? byte-data)
    (js/Uint8Array.from (.split byte-data ""))
    (js/Uint8Array.from byte-data))
