(ns lib.auth-test
  "Test authentication."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.proto.http :as http]))


#_(deftest from-json-test
  (testing "parse empty object"
    (let [json-str "{}"
          keywordize? false
          data (json/from-json json-str keywordize?)]
      (is (= {} data)
          "parsed JSON string object becomes map"))))
