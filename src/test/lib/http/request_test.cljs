(ns lib.http.request-test
  "Test various http request-related functionality."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.http.request :as http.request]))

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

;; Define a mock IncomingMessage type to use for testing request
;; conversion into a request data map.
#_(deftype IncomingMessage
    [;; Key/value pairs of header names and values; header names are
     ;; lower-cased.
     headers
     ;; Probably "1.1" or "1.0".
     httpVersion
     ;; The HTTP request method as an uppercase string.
     method
     ;; A string array of raw request/response headers; all keys and
     ;; values are in same list. E.g.
     ;; ['user-agent', 'some/agent', 'host', '127.0.0.1:8000', ...].
     rawHeaders
     ;; A string array of raw request/response trailer keys/values.
     rawTrailers
     ;; A numeric HTTP response status code.
     statusCode
     ;; A net.Socket object.
     socket
     ;; An object containing the trailers.
     trailers
     ;; The request URL string.
     url]
  Object
  (destroy [this] "destroyed!")
  (setTimeout [this ms] "setTimeout"))

;; TODO create wrapper utility fn to build an IncomingMessage.
#_(defn incoming-message
  [m]
  (let [headers (clj->js (get m :headers {}))]
    (->IncomingMessage headers)))

#_(deftest req->map-test
  (testing ""
    (let [url "/foo/bar"
          headers #js {"foo" "bar"}
          message (incoming-message {:headers headers :url url})
          request (http.request/req->map message)]
      (is (map? request)
          "result is a map")
      )))
