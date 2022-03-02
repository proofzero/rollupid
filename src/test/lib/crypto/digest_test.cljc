(ns lib.crypto.digest-test
  "Test crypto digest implementations."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [clojure.string :as str])
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]))

(deftest sha2-256-test
  (testing "sha256 digest"
    (let [input [0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15]
          ;; TODO Verify this hash with external tool 
          expected #?(:clj "be45cb2605bf36bebde684841a28f0fd43c69850a3dce5fedba69928ee3a8991"
                      :cljs "be45cb2605bf36bebde684841a28f0fd43c69850a3dce5fedba69928ee3a8991")
          output (lib.digest/sha2-256 input)]
      (is (= expected output)
          "hash of string has expected output"))))

(deftest sha3-256-test
  (testing "sha3 digest"
    (let [input [0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15]
          ;; TODO verify this hash with external tool 
          expected #?(:clj "39462d2a2320f8da572a97b0b39473d4312e0228b23e2c2fe0ae9b6c67f2343c"
                      :cljs "39462d2a2320f8da572a97b0b39473d4312e0228b23e2c2fe0ae9b6c67f2343c")
          output (lib.digest/sha3-256 input)]
      (is (= expected output)
          "hash of string has expected output"))))
