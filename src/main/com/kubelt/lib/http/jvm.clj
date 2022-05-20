(ns com.kubelt.lib.http.jvm
  "Support for HTTP requests from a JVM execution context."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [camel-snake-kebab.core :as csk]
   [hato.client :as hc]
   [jsonista.core :as json]
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.http.shared :as http.shared]
   [com.kubelt.lib.http.status :as http.status]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.proto.http :as proto.http]
   [com.kubelt.spec.http :as spec.http]))

(defn- to-client-part
  "Convert a multipart part map in internal format into the map format
  expected by our HTTP client."
  [m]
  (let [param-name (get m :param/name)
        content (get m :part/content)
        media-type (get m :part/media-type)]
    {:name param-name
     :content content
     :content-type media-type}))

(defn multipart?
  [x]
  (and
   (map? x)
   (= :kubelt.type/multipart (get x :com.kubelt/type))))

(defn- to-body
  "Take body data and, if it is in an internal format, e.g. a multipart
  map, convert it into something that our HTTP client expects."
  [x]
  (cond
    ;; Body contains multipart form data. To send multipart form data
    ;; our HTTP client wants a key named :multipart in the request map
    ;; whose value is a sequence of maps describing each part.
    (multipart? x)
    (let [parts (get x :multipart)
          multipart (map to-client-part parts)]
      {:multipart multipart})
    ;; Return the body unchanged.
    :else {:http/body x}))

(defn- to-params
  "Given a map of query parameters, convert values that would cause
  trouble for the HTTP client into strings, e.g. convert a boolean value
  to a canonical string representation. Returns a map that can be merged
  into an HTTP client request map."
  [params]
  {:query-params params})

;; TODO make generic utility: request map to URI
;;:accept ""
;;:content-type ""
;;:as :string
;;:coerce
;;:form-params {}
(defn- request->ring
  [m]
  {:pre [(map? m)]}
  (let [method (get m :http/method)
        headers (get m :http/headers {})
        scheme (name (get m :uri/scheme))
        domain (get m :uri/domain)
        port (get m :uri/port)
        path (get m :uri/path)
        host (cstr/join ":" [domain port])
        url (str scheme "://" host path)]
    (merge
     {:method method
      :headers headers
      :url url}
     (if-let [params-map (get m :uri/query)]
       (to-params params-map)
       {})
     (if-let [body-data (get m :http/body)]
       (to-body body-data)
       {}))))

;; Public
;; -----------------------------------------------------------------------------
;; TODO support request headers
;; TODO put patch post delete
;; TODO convert response to response map
;; TODO validate response map
;; TODO use malli transformers to convert to internal types, e.g. CID

;; TODO store a client instance for use over multiple requests:
;; (hc/build-http-client)
(defrecord HttpClient []
  proto.http/HttpClient
  (request!
    [this request]
    (lib.error/conform*
     [spec.http/request request]
     (let [;; Convert our incoming request map (matching our internal
           ;; format for describing HTTP requests) into a ring-format
           ;; map understood by the HTTP client.
           options (request->ring request)
           ;; Configure how the request is executed.
           default-options {:async? true
                            :timeout 10000}
           options (merge default-options options)

           ;; TODO :as :byte-array, :stream (returns InputStream)
           ;; Look at preferred response media type?
           ;;options (assoc options :as :byte-array)

           ;; Perform the request, returning a completable future. The
           ;; callback puts the response on the channel that is returned
           ;; from this function.
           response @(hc/request options)
           status (get response :status)]
       (if-not (http.status/success? status)
         ;; TODO pass through error returned from server.
         {:com.kubelt/type :kubelt.type/error
          :error {:fixme true}}
         ;; We have a success status, process the response body.
         (let [content-type (get response :content-type)
               body (get response :body)
               keywordize? (get request :response/keywordize? true)]
           (condp = content-type
             ;; TODO use media type constant.
             :application/json (lib.json/from-json body keywordize?)
             ;; If no match, return body unchanged.
             body)))))))
