(ns lib.http.request-test
  "Test various http request-related functionality."
  {:copyright "©2022 Proof Zero Inc." :license "UNLICENSED"}
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.http.request :as http.request]
   [com.kubelt.proto.http :as http])
  #?(:browser
     (:require
      [com.kubelt.lib.http.browser :as lib.http])
     :clj
     (:require
      [com.kubelt.lib.http.jvm :as lib.http])
     :node
     (:require
      [com.kubelt.lib.http.node :as lib.http])))

(deftest method?-test
  (testing "get request"
    (let [request {:http/method :get}]
      (is (http.request/get? request)
          "detect a GET request")))
  (testing "patch request"
    (let [request {:http/method :patch}]
      (is (http.request/patch? request)
          "detect a PATCH request")))
  (testing "post request"
    (let [request {:http/method :post}]
      (is (http.request/post? request)
          "detect a POST request")))
  (testing "put request"
    (let [request {:http/method :put}]
      (is (http.request/put? request)
          "detect a PUT request")))
  (testing "delete request"
    (let [request {:http/method :delete}]
      (is (http.request/delete? request)
          "detect a DELETE request"))))

#_(deftest request-get-test
  (testing "GET"
    (let [c (lib.http/->HttpClient)
          request {:com.kubelt/type :kubelt.type/http-request}]
      )))
