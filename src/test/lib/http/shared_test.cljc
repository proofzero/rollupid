(ns lib.http.shared-test
  "Test shared HTTP utilities."
  #?(:clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]])
     :cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.http.shared :as lib.shared]
   [com.kubelt.spec.http :as spec.http]))

;; TODO test that the default configuration is valid.

(deftest method-test
  (testing "get method from request map"
    (let [request {:http/method :get}
          result (lib.shared/request->method request)]
      (is (string? result)
          "method is a string")
      (is (= "GET" result)
          "method has correct name"))))

(deftest domain-test
  (testing "get domain from request map"
    (let [domain "example.com"
          request {:uri/domain domain}
          result (lib.shared/request->domain request)]
      (is (string? result)
          "domain is a string")
      (is (= domain result)
          "expected value is returned"))))

(deftest port-test
  (testing "get port from request map"
    (let [port 1234
          request {:uri/port port}
          result (lib.shared/request->port request)]
      (is (integer? result)
          "port is an integer")
      (is (= port result)
          "expected port is returned"))))

(deftest path-test
  (testing "get path from request map"
    (let [path "/foo"
          request {:uri/path path}
          result (lib.shared/request->path request)]
      (is (string? result)
          "domain is a string")
      (is (= path result)
          "expected path is returned"))))

(deftest headers-test
  (testing "get headers from request map"
    (let [headers {"X-Example" "foobar"}
          request {:http/headers headers}
          result (lib.shared/request->headers request)]
      (is (map? result)
          "headers are a map")
      (is (= headers result)
          "expected headers are returned"))))

(deftest body-test
  (testing "get body from request map"
    (let [body "foobar"
          request {:http/body body}
          result (lib.shared/request->body request)]
      (is (string? result)
          "string body has correct type")
      (is (= body result)
          "expected body is returned"))))

(deftest scheme-test
  (testing "get scheme from request map"
    (let [scheme :http
          request {:uri/scheme scheme}
          result (lib.shared/request->scheme request)]
      (is (string? result)
          "scheme has correct type")
      (is (= "http" result)
          "expected scheme is returned"))))

(deftest url-test
  (testing "basic http URL"
    (let [request {:uri/scheme :http
                   :uri/domain "example.com"}
          result (lib.shared/request->url request)]
      (is (= "http://example.com" result)
          "URL has expected value")))

  (testing "basic https URL"
    (let [request {:uri/scheme :https
                   :uri/domain "example.com"}
          result (lib.shared/request->url request)]
      (is (= "https://example.com" result)
          "URL has expected value"))))
