(ns lib.base64-test
  "Test base64 en/decoding."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]]
      [goog.iter])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [com.kubelt.lib.base64 :as base64]))

;; Utilities
;; -----------------------------------------------------------------------------

(defn str->bytes
  "Convert a string into a byte array. In Clojure this is a [B, while in
  ClojureScript it returns a Uint8Array."
  [s]
  #?(:clj (bytes (byte-array (map (comp byte int) s)))
     :cljs (let [text-encoder (js/TextEncoder.)]
             (.encode text-encoder s))))

(defn same-bytes?
  [a b]
  #?(:clj (let [a (map int a)
                b (map int b)]
            (if (and a b (= (count a) (count b)))
              (zero? (reduce bit-or 0 (map bit-xor a b)))
              false))
     :cljs (goog.iter/equals a b)))

;; Tests
;; -----------------------------------------------------------------------------

(deftest string-test
  (testing "encode basic string"
    (let [input "foobar"
          expected "Zm9vYmFy"
          encoded (base64/encode input)
          decoded (base64/decode-string encoded)]
      (is (= expected encoded)
          "encoded string must match expected output")
      (is (= input decoded)
          "decoded string must match initial input"))))

(deftest bytes-test
  (testing "encode bytes"
    (let [input-str "foobar"
          input-bytes (str->bytes input-str)
          expected "Zm9vYmFy"
          encoded (base64/encode input-bytes)
          decoded-str (base64/decode-string encoded)
          decoded-bytes (base64/decode-bytes encoded)]
      (is (= expected encoded)
          "encoded bytes must match expected output")
      (is (= input-str decoded-str)
          "decoded as string must match input string")
      (is (same-bytes? input-bytes decoded-bytes)
          "decoded as bytes must match input bytes"))))
