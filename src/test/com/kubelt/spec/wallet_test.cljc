(ns com.kubelt.spec.wallet-test
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing]]))
  (:require [com.kubelt.spec.wallet :as spec.wallet]
            [com.kubelt.gen.wallet :as gen.wallet]
            [malli.core :as m]
            [malli.generator :as mg]))

(defn- hex-0x-test-length [length]
  (let [hex (gen.wallet/hex-0x (spec.wallet/hex-0x length))
        generated (mg/generate hex)]
    (is (m/validate hex generated)
        {:generated-value generated
         :error (str "no valid hex-0x generated value with lenght" length)})))

(deftest hex-0x-test
  (testing "hex-0x validation and generation"
    (hex-0x-test-length 10)
    (hex-0x-test-length 128)
    (hex-0x-test-length 256)))

(deftest wallet-test
  (testing "hex validation and generation"
    (let [generated (mg/generate (gen.wallet/wallet-address spec.wallet/wallet-address))]
      (is (m/validate spec.wallet/wallet-address generated)
          {:generated-value generated
           :error (str "no valid wallet generated")}))))
