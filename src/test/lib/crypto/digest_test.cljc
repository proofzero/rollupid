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
    (let [input "foobar"
          expected #?(:clj "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
                      :cljs "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2")
          output (lib.digest/sha2-256 input)]
      (is (= expected output)
          "hash of string has expected output"))))

(deftest sha3-256-test
  (testing "sha3 digest"
    (let [input "foobar"
          expected #?(:clj "fixme"
                      :cljs "c1545e05e6777d834652396ad104e7e971a78d084a9b9df34f7a16fd493bf2b0")
          output (lib.digest/sha3-256 input)]
      (is (= expected output)
          "hash of string has expected output"))))
