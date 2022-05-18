(ns com.kubelt.lib.http.request
  "Miscellaneous HTTP request utilties."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  #?(:cljs
     (:require
      [goog.Uri]
      [goog.object]))
  ;; NB: extra per-target reader conditionals are a shadow-cljs *only*
  ;; feature.
  #?(:node
     (:require
      ["stream" :refer [Duplex]]
      ["http" :as http :refer [IncomingMessage]]))
  (:require
   [clojure.string :as str]))

;; TODO malli schemas for request and response maps

;; Public
;; -----------------------------------------------------------------------------

;; TODO test me
(defn get?
  [m]
  (= :get (:http/method m)))

;; TODO test me
(defn patch?
  [m]
  (= :patch (:http/method m)))

;; TODO test me
(defn post?
  [m]
  (= :post (:http/method m)))

;; TODO test me
(defn put?
  [m]
  (= :put (:http/method m)))

;; TODO test me
(defn delete?
  [m]
  (= :delete (:http/method m)))

;; TODO convert to .cljc
;; TODO test me
#?(:cljs
   (defn req->map
     "Convert a Node.js HTTP request (an IncomingMessage instance) into a
  data map of its component parts."
     [^IncomingMessage req]
     (let [method (keyword (str/lower-case (.-method req)))
           version (.-httpVersion req)
           headers (.-headers req)
           trailers (.-trailers req)
           status (.-statusCode req)
           body "fixme"
           ;; Extract data from the request URL.
           req-url (goog.Uri. (.-url req))
           req-host (goog.object/getValueByKeys req #js ["headers" "host"])
           ;; Use the request's socket "encrypted" flag to determine we the
           ;; request was transmitted via TLS or not.
           req-scheme (if (. ^Duplex (. req -socket) -encrypted) "https://" "http://")
           req-base (goog.Uri. (str req-scheme req-host))
           uri (goog.Uri.resolve req-base req-url)
           ;; Extract components from the URI.
           port (.getPort uri)
           path (.getPath uri)
           fragment (.getFragment uri)
           ;; TODO turn into map (query-data->map)
           ;;query-data (.getQueryData uri) -> goog.Uri.QueryData
           query (.getDecodedQuery uri)
           scheme (.getScheme uri)
           domain (.getDomain uri)
           user (.getUserInfo uri)]
       {:kubelt/type :kubelt.type/uri
        :http/method method
        :http/version version
        :http/headers headers
        :http/trailers trailers
        :http/status status
        :http/body body
        :uri/scheme scheme
        :uri/port port
        :uri/path path
        :uri/fragment fragment
        :uri/query query
        :uri/domain domain
        :uri/user user})))
