(ns lib.json-test
  "Test JSON-related utilities."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.json :as json]))


(deftest from-json-test
  (testing "parse empty object"
    (let [json-str "{}"
          keywordize? false
          data (json/from-json json-str keywordize?)]
      (is (= {} data)
          "parsed JSON string object becomes map")))

  (testing "parse empty array"
    (let [json-str "[]"
          keywordize? false
          data (json/from-json json-str keywordize?)]
      (is (= [] data)
          "parsed JSON string array becomes vector"))))
