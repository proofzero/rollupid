(ns com.kubelt.p2p.request
  "HTTP request utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [goog.Uri]
   [goog.object])
  (:require
   ["http" :as http :refer [IncomingMessage]]))

;; Public
;; -----------------------------------------------------------------------------

(defn req->uri-map
  "Extract the URI from an HTTP request and return it as a map of its
  component parts."
  [^IncomingMessage req]
  (let [req-url (goog.Uri. (.-url req))
        req-host (goog.object/getValueByKeys req #js ["headers" "host"])
        ;; TODO don't hardcode http://; get from request
        req-base (goog.Uri. (str "http://" req-host))
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
     :uri/port port
     :uri/path path
     :uri/fragment fragment
     :uri/query query
     :uri/scheme scheme
     :uri/domain domain
     :uri/user user}))
