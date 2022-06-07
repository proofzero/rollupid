(ns com.kubelt.spec.common-test
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing]]))
  (:require [com.kubelt.spec.common :as common]
            [malli.core :as m]
            [malli.generator :as mg]))

(defn test-length [length]
  (let [hex (common/hex length)
        generated (mg/generate hex)]
    (is (m/validate hex generated)
        {:generated-value generated
         :error (str "no valid hex generated value with lenght" length)})))

(deftest hex-test
  (testing "hex validation and generation"
    (test-length 10)
    (test-length 128)
    (test-length 256)))
