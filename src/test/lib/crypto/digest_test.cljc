(ns lib.crypto.digest-test
  "Test crypto digest implementations."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [com.kubelt.lib.crypto.digest :as lib.digest]))

;; To generate expected hashes use openssl:
;; (SHA2-256) $ echo -n foobar | openssl dgst -sha256
;; (SHA3-256) $ echo -n foobar | openssl dgst -sha3-256

(deftest sha2-256-test
  (testing "sha2-256 digest of string"
    (let [input "foobar"
          hex-string "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
          ;; TODO use hexify/as-bytes?
          digest-bytes #?(:clj (byte-array 10)
                          :cljs (js/Uint8Array.from "fixme"))
          output (lib.digest/sha2-256 input)]
      ;; TODO validate with malli schema.
      (is (map? output)
          "digest is a map")
      (is (= :kubelt.type/digest (get output :com.kubelt/type))
          "digest has expected type keyword")
      (is (= :digest.algorithm/sha2-256 (get output :digest/algorithm))
          "digest has expected algorithm keyword")
      (is (= hex-string (get output :digest/hex-string))))))

(deftest sha3-256-test
  (testing "sha3-256 digest of string"
    (let [input "foobar"
          hex-string "9c5bbf00bb6103c7f3d91fe598489725341010b8d0785274029d4645c34ebe9c"
          ;; TODO use hexify/as-bytes?
          digest-bytes #?(:clj (byte-array 10)
                          :cljs (js/Uint8Array.from "fixme"))
          output (lib.digest/sha3-256 input)]
      ;; TODO validate digest with malli schema
      (is (map? output)
          "digest is a map")
      (is (= :kubelt.type/digest (get output :com.kubelt/type))
          "digest has expected type keyword")
      (is (= :digest.algorithm/sha3-256 (get output :digest/algorithm))
          "digest has expected algorithm keyword"))))
