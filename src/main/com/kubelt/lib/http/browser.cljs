(ns com.kubelt.lib.http.browser
  "Support for HTTP requests from a browser execution context."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [goog.net.XhrIo :as xhrio]
   [goog.url :as gurl])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.http.shared :as http.shared]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.proto.http :as proto.http]
   [com.kubelt.spec.http :as spec.http]))

;; Internal
;; -----------------------------------------------------------------------------

(comment
  "request map example"
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
   :uri/user user})


(defn- make-response-fn
  "Returns a response handler function for an HTTP request send using
  XhrIo."
  [cb]
  {:pre [(fn? cb)]}
  (fn [^js event]
    (let [res (-> event .-target .getResponseText)]
      ;; TODO Return a structured map containing the response data. The
      ;; structure needs to be schematized as a spec, e.g.
      ;; {:body {:text ...}}
      (cb res))))

;; Public
;; -----------------------------------------------------------------------------

(defrecord HttpClient []
  proto.http/HttpClient

  (request!
    [this m]
    (proto.http/request-cb this m #(fn [rtext] rtext)))

  (request-cb
    [this m cb]
    (if-not (malli/validate spec.http/request m)
      ;; The request map is invalid, return a map describing the error.
      (lib.error/explain spec.http/request m)
      ;; We have a valid request map, construct a URL from it before
      ;; making a request.
      (let [url-or-error (http.shared/request->url m)]
        (if (lib.error/error? url-or-error)
          ;; Constructed URL wasn't valid, return an error map.
          url-or-error
          ;; Perform the HTTP request.
          (let [method (http.shared/request->method m)
                body (http.shared/request->body m)
                headers (http.shared/request->headers m)
                headers-obj (clj->js headers)
                ;; 0 means no timeout.
                timeout-ms 0
                on-response (make-response-fn cb)]
            (xhrio/send url-or-error
                        on-response
                        method body
                        headers-obj
                        timeout-ms)))))))
