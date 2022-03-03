(ns lib.uuid-test
  "Test UUID operations."
  #?(:clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]])
     :cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
    [malli.core :as malli])
  (:require
   [com.kubelt.lib.uuid :as lib.uuid]))

(def uuid-regex
  #"^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$")

(deftest random-test
  (testing "random UUID generation"
    (let [output (lib.uuid/random)]
      (is (string? output)
          "output is a string")
      (is (re-matches uuid-regex output)
          "output string matches UUID regex"))))
