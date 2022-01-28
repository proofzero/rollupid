(ns com.kubelt.spec.http
  "Schema for HTTP requests and responses."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; TODO test me

(def method
  [:enum :delete :get :patch :post :put])

(def host
  string?)

(def port
  int?)

(def path
  string?)

(def headers
  [:map-of string? [:or string? number?]])

(def body
  string?)

;; response
;; -----------------------------------------------------------------------------

(def response
  [:map
   [:kubelt/type [:enum :kubelt.type/http-response]]])

;; request
;; -----------------------------------------------------------------------------

(def request
  [:map
   [:kubelt/type [:enum :kubelt.type/http-request]]
   [:http/method method]
   [:http/host host]
   [:http/port port]
   [:http/path path]
   [:http/headers {:optional true} headers]
   [:http/body {:optional true} body]])

(def request-schema
  [:and
   {:name "HTTP Request"
    :description "An HTTP request map"
    :example {:fixme true}}
   request])
