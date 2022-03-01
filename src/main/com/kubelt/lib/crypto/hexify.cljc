(ns com.kubelt.lib.crypto.hexify
  "Generate hex strings from byte data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [org.bouncycastle.util.encoders Hex])))

;; TODO browser
(defn hex-string
  [byte-data]
  #?(:clj
     (Hex/toHexString byte-data)
     :node
     (let [buffer (js/Buffer.from byte-data)]
       (.toString buffer "hex"))))
