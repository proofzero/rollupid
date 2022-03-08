(ns lib.crypto.keypair-test
  "Test crypto keypair implementations."
  (:require
   #?@(:clj
       [[clojure.test :as t :refer [deftest is testing use-fixtures]]]
       :cljs
       [[cljs.test :as t :refer [deftest is testing use-fixtures]]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.crypto.keypair :as lib.keypair]
   [com.kubelt.lib.crypto.seed :as lib.seed]
   [com.kubelt.lib.octet :as lib.octet]
   [com.kubelt.spec.crypto :as spec.crypto]))


(deftest generate-test
  (testing "without seed"
    (let [keypair (lib.keypair/generate)]
      (is (malli/validate spec.crypto/keypair keypair)
          "keypair conforms to schema")))

  (testing "with random seed"
    (let [seed (lib.seed/random)
          keypair (lib.keypair/generate seed)]
      (is (malli/validate spec.crypto/keypair keypair)
          "keypair conforms to schema")))

  (testing "with passphrase seed"
    (let [seed (lib.seed/from-passphrase "foobar")
          keypair (lib.keypair/generate seed)]
      (is (malli/validate spec.crypto/keypair keypair)
          "keypair conforms to schema"))))

(deftest sign-test
  (testing "sign and verify"
    (let [input "foobar"
          data-bytes (lib.octet/as-bytes input)
          bad-bytes (lib.octet/as-bytes "xxx")
          keypair (lib.keypair/generate)
          signature (lib.keypair/sign keypair data-bytes)]
      (is (malli/validate spec.crypto/signature signature)
          "signature conforms to schema")
      (is (lib.keypair/verify keypair signature data-bytes)
          "signature is valid for correct input data")
      (is (not (lib.keypair/verify keypair signature bad-bytes))
          "signature is invalid for wrong input data"))))
