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

(def version
  string?)

(def port
  ;; TODO constrain to valid port range
  int?)

(def path
  string?)

(def headers
  [:map-of string? [:or string? number?]])

(def trailers
  [:map-of string? [:or string? number?]])

(def status
  number?)

(def body
  string?)

(def scheme
  [:enum :http :https])

(def fragment
  string?)

(def query
  [:map-of string? string?])

(def domain
  string?)

(def user
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
   [:http/version {:optional true} version]
   [:http/headers {:optional true} headers]
   [:http/trailers {:optional true} trailers]
   [:http/status {:optional true} status]
   [:http/body {:optional true} body]
   [:uri/scheme scheme]
   [:uri/port port]
   [:uri/path path]
   [:uri/fragment {:optional true} fragment]
   [:uri/query {:optional true} query]
   [:uri/domain domain]
   [:uri/user {:optional true} user]])

(def request-schema
  [:and
   {:name "HTTP Request"
    :description "An HTTP request map"
    :example {:fixme true}}
   request])
