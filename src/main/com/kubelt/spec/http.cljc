(ns com.kubelt.spec.http
  "Schema for HTTP requests and responses."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; TODO test me

(def method
  [:enum :delete :get :patch :post :put])

(def scheme
  [:enum :http :https])

(def path
  [:and
   {:example "/example"}
   :string])

(def host
  [:and
   {:example "127.0.0.1"}
   :string])

(def port
  [:and
   {:example 5001
    :min 0
    :max 65535}
   :int])

(def version
  string?)

(def headers
  [:map-of string? [:or string? number?]])

(def trailers
  [:map-of string? [:or string? number?]])

(def status
  number?)

(def param-name
  :string)

(def media-type
  :string)

(def multipart-name
  :string)

;; clj: String, InputStream, Reader, File, char-array, byte-array
(def multipart-content
  :any)

(def multipart-file-name
  :string)

(def multipart-parts
  [:vector
   [:map
    [:param/name param-name]
    [:part/name {:optional true} multipart-name]
    [:part/content multipart-content]
    [:part/file-name {:optional true} multipart-file-name]
    [:part/media-type {:optional true} media-type]]])

(def multipart
  [:map
   [:com.kubelt/type [:enum :kubelt.type/multipart]]
   [:multipart multipart-parts]])

;; TODO specify Buffer/Uint8Array for CLJS?
(def uint8-array
  #?(:clj bytes?))

(def body
  [:or
   uint8-array
   string?
   multipart])

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
   [:com.kubelt/type [:enum :kubelt.type/http-request]]
   [:http/method method]
   [:http/version {:optional true} version]
   [:http/headers {:optional true} headers]
   [:http/trailers {:optional true} trailers]
   [:http/status {:optional true} status]
   [:http/body {:optional true} body]
   [:uri/port {:optional true} port]
   [:uri/fragment {:optional true} fragment]
   [:uri/query {:optional true} query]
   [:uri/user {:optional true} user]
   [:uri/scheme scheme]
   [:uri/domain domain]
   [:uri/path path]])

(def request-schema
  [:and
   {:name "HTTP Request"
    :description "An HTTP request map"
    :example {:fixme true}}
   request])
