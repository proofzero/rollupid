(ns http.content-test
  "Test content negotiation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.http.content :as http.content]))


(deftest q-factor-test
  (testing "default quality value is 1"
    )
  (testing "more specific values come before less"
    (let [text-html "text/html;q=0.8"
          text-star "text/*;q=0.8"
          star-star "*/*;q=0.8"
          q-str (str/join ", " [star-star text-star text-html])
          parsed (http.content/q-factor q-str)]
      (is (seq? parsed)
          "result is a sequence")
      (is (= 3 (count parsed))
          "result has correct size")
      (is (= ["text/html" "text/*" "*/*"] (into [] parsed))
          "result has correct order"))))

(deftest accept-encoding-test
  ;; "deflate, gzip;q=1.0, *;q=0.5"
  )
