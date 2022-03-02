(ns lib.crypto.seed-test
  "Test crypto seed generation."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.crypto.seed :as lib.seed]
   [com.kubelt.spec.crypto :as spec.crypto]))

(deftest seed?-test
  (testing "invalid number seed"
    (let [not-seed "xxxx"]
      (is (not (lib.seed/seed? not-seed))
          "a number is not a seed")))
  (testing "invalid string seed"
    (let [not-seed "xxxx"]
      (is (not (lib.seed/seed? not-seed))
          "a string is not a seed")))
  (testing "valid seed"
    (let [seed (lib.seed/random)]
      (is (lib.seed/seed? seed)
          "a seed is a seed"))))

(deftest random-test
  (testing "create random seed"
    (let [seed (lib.seed/random)]
      (is (malli/validate spec.crypto/seed seed)
          "seed conforms to schema"))))
