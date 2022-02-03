(ns http.media-type-test
  "Test media type parsing."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.http.media-type :as http.media-type]))


(deftest decode-test
  (testing "parse basic media type"
    (let [major "application"
          minor "json"
          media-type (str/join "/" [major minor])
          parsed (http.media-type/decode media-type)]
      (is (map? parsed)
          "result should be a map")
      ;; TODO test against malli schema
      (is (contains? parsed :com.kubelt/type)
          "result has a type key")
      (is (= :kubelt.type/media-type (:com.kubelt/type parsed))
          "result has expected type")
      (is (http.media-type/media-type? parsed)
          "detect valid media-type value")
      (is (= major (get parsed :media/type))
          "result has expected type")
      (is (= minor (get parsed :media/subtype))
          "result has expected subtype")
      (is (= "" (get parsed :media/prefix))
          "prefix is empty")
      (is (= "" (get parsed :media/suffix))
          "suffix is empty")
      (is (= {} (get parsed :media/params))
          "there are no parameters")))

  (testing "parse media type with suffix"
    (let [major "application"
          minor "ld"
          suffix "json"
          media-type (str major "/" minor "+" suffix)
          parsed (http.media-type/decode media-type)]
      (is (map? parsed))
      (is (contains? parsed :com.kubelt/type))
      (is (= :kubelt.type/media-type (:com.kubelt/type parsed)))
      (is (http.media-type/media-type? parsed))
      (is (= major (get parsed :media/type)))
      (is (= minor (get parsed :media/subtype)))
      (is (= "" (get parsed :media/prefix)))
      (is (= suffix (get parsed :media/suffix)))
      (is (= {} (get parsed :media/params))))))

(deftest standard-tree-test
  (testing "string input"
    (let [media-type "application/json"]
      (is (http.media-type/standard-tree? media-type)
          "detect standard tree from string input")))
  (testing "parsed input"
    (let [media-type "application/json"
          parsed (http.media-type/decode media-type)]
      (is (http.media-type/standard-tree? parsed)
          "detect standard tree from parsed input"))))

(deftest vendor-tree-test
  (testing "string input"
    (let [media-type "application/vnd.foobar"]
      (is (http.media-type/vendor-tree? media-type)
          "detect vendor tree from string input")))
  (testing "parsed input"
    (let [media-type "application/vnd.foobar"
          parsed (http.media-type/decode media-type)]
      (is (http.media-type/vendor-tree? parsed)
          "detect vendor tree from parsed input"))))

(deftest personal-tree-test
  (testing "string input"
    (let [media-type "application/prs.foobar"]
      (is (http.media-type/personal-tree? media-type)
          "detect personal tree from string input")))
  (testing "parsed input"
    (let [media-type "application/prs.foobar"
          parsed (http.media-type/decode media-type)]
      (is (http.media-type/personal-tree? parsed)
          "detect personal tree from parsed input"))))

(deftest unregistered-tree-test
  (testing "string input"
    (let [media-type "application/x.foobar"]
      (is (http.media-type/unregistered-tree? media-type)
          "detect unregistered tree from string input")))
  (testing "parsed input"
    (let [media-type "application/x.foobar"
          parsed (http.media-type/decode media-type)]
      (is (http.media-type/unregistered-tree? parsed)
          "detect unregistered tree from parsed input"))))
