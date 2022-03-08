(ns lib.crypto.digest-test
  "Test crypto digest implementations."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]
   [com.kubelt.spec.crypto :as spec.crypto]))

;; To generate expected hashes use openssl:
;; (SHA2-256) $ echo -n foobar | openssl dgst -sha256
;; (SHA3-256) $ echo -n foobar | openssl dgst -sha3-256

(deftest sha2-256-test
  (testing "sha2-256 digest of string"
    (let [input "foobar"
          hex-string "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
          output (lib.digest/sha2-256 input)]
      (is (malli/validate spec.crypto/digest output)
          "digest conforms to schema")
      (is (= :digest.algorithm/sha2-256 (get output :digest/algorithm))
          "digest has expected algorithm keyword")
      (is (= hex-string (get output :digest/hex-string))
          "digest has expected string representation"))))

(deftest sha3-256-test
  (testing "sha3-256 digest of string"
    (let [input "foobar"
          hex-string "09234807e4af85f17c66b48ee3bca89dffd1f1233659f9f940a2b17b0b8c6bc5"
          output (lib.digest/sha3-256 input)]
      (is (malli/validate spec.crypto/digest output)
          "digest conforms to schema")
      (is (= :digest.algorithm/sha3-256 (get output :digest/algorithm))
          "digest has expected algorithm keyword")
      (is (= hex-string (get output :digest/hex-string))
          "digest has expected string representation"))))
