(ns example.example-test
  "Example test setup."
  {:author "Kubelt Inc." :year 2021 :license "UNLICENSED"}
  (:require
   [cljs.test :as t :refer [deftest is use-fixtures]]))


(deftest failing-test
  "Not going to work!"
  (is (= true false)))
