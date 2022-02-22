(ns lib.crypto.hexify-test
  "Test byte to hex conversion."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [com.kubelt.lib.crypto.hexify :as lib.hexify]))

(deftest hex-string-from-bytes-test
  (testing "bytes to hex string"
    (let [input #?(:clj (byte-array [0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15])
                   :cljs (js/Uint8Array. [0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15]))
          expected "000102030405060708090a0b0c0d0e0f"
          output (lib.hexify/hex-string input)]
      (is (= expected output)
          "hex string has expected value"))))

(deftest hex-string-from-string-test
  (testing "string to hex string"
    (let [input "input string"
          expected "696e70757420737472696e67"
          output (lib.hexify/hex-string input)]
      (is (= expected output)
          "hex string has expected value"))))
