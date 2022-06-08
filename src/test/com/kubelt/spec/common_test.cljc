(ns com.kubelt.spec.common-test
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing]]))
  (:require [com.kubelt.spec.common :as spec.common]
            [com.kubelt.lib.gen.common :as gen.common]
            [malli.core :as m]
            [malli.generator :as mg]))

(defn- hex-test-length [length]
  (let [hex (gen.common/hex (spec.common/hex length))
        generated (mg/generate hex)]
    (is (m/validate hex generated)
        {:generated-value generated
         :error (str "no valid hex generated value with lenght" length)})))

(deftest hex-test
  (testing "hex validation and generation"
    (hex-test-length 10)
    (hex-test-length 128)
    (hex-test-length 256)))
