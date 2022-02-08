(ns com.kubelt.lib.http.jvm
  "Support for HTTP requests from a JVM execution context."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.core.async :as async :refer [>! go]]
   [clojure.string :as str])
  (:require
   [camel-snake-kebab.core :as csk]
   [hato.client :as hc]
   [jsonista.core :as json]
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.http.shared :as http.shared]
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
    :else x))

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
        host (str/join ":" [domain port])
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

;; Replaces default json/keyword-keys-object-mapper.
(def keyword-mapper
  (json/object-mapper
   {:encode-key-fn csk/->camelCaseString
    :decode-key-fn csk/->kebab-case-keyword}))

(defn from-json
  [body keywordize?]
  (if keywordize?
    (json/read-value body keyword-mapper)
    (json/read-value body)))

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
    [this m]
    (if-not (malli/validate spec.http/request m)
      ;; TODO report an error using common error reporting
      ;; functionality (anomalies).
      (let [explain (-> spec.http/request (malli/explain m) me/humanize)
            error {:com.kubelt/type :kubelt.type/error
                   :error explain}
            response-chan (async/chan)]
        (async/put! response-chan error)
        response-chan)
      ;; The request map is valid, so fire off the request.
      (let [scheme (get m :uri/scheme :http)
            request-map (dissoc m :uri/scheme)
            ;; Convert our incoming request map (matching our internal
            ;; format for describing HTTP requests) into a ring-format
            ;; map understood by the HTTP client.
            options (request->ring request-map)
            ;; Configure how the request is executed.
            default-options {:async? true
                             :timeout 10000}
            options (merge default-options options)
            ;; Use an unbuffered channel for the response.
            response-chan (async/chan)
            on-response (fn [resp] (go (async/put! response-chan resp)))]
        ;; Perform the request, returning a completable future. The
        ;; callback puts the response on the channel that is returned
        ;; from this function.
        (hc/request options on-response identity)
        ;; Return the channel on which the response will be placed.
        response-chan)))

  (request-sync
    [this request]
    (if-not (malli/validate spec.http/request request)
      (let [explain (-> spec.http/request (malli/explain request) me/humanize)
            error {:com.kubelt/type :kubelt.type/error
                   :error explain}]
        error)
      ;; The request map is valid, so fire off the request.
      (let [default-options {:timeout 10000}
            ;; Convert our incoming request map (matching our internal
            ;; format for describing HTTP requests) into a Ring-format
            ;; map understood by the HTTP client.
            ring-request (request->ring request)
            options (merge default-options ring-request)

            ;; TODO :as :byte-array, :stream (returns InputStream)
            ;; Look at preferred response media type?
            ;;options (assoc options :as :byte-array)

            ;; Perform the request!
            response (hc/request options)
            status (get response :status)]
        ;; TODO use HTTP status constants/predicates to check for
        ;; non-error response.
        (if-not (= 200 status)
          ;; TODO pass through error returned from server.
          {:com.kubelt/type :kubelt.type/error
           :error {:fixme true}}
          ;; We have a success status, process the response body.
          (let [content-type (get response :content-type)
                body (get response :body)
                keywordize? (get request :response/keywordize? true)]
            (condp = content-type
              ;; TODO use media type constant.
              :application/json (from-json body keywordize?)
              ;; If no match, return body unchanged.
              body))))))

  (request-cb
    [this request callback]
    ;; Check that we have been given a valid request description.
    (if-not (malli/validate spec.http/request request)
      ;; TODO report an error using common error reporting
      ;; functionality (anomalies).
      (let [explain (-> spec.http/request (malli/explain request) me/humanize)
            error {:com.kubelt/type :kubelt.type/error
                   :error explain}]
        error))
    ;; We have a valid request map.
    (let [;; Configure how request is executed.
          default-options {:async? true
                           :timeout 10000}
          ;; Convert our incoming request map (matching our internal
          ;; format for describing HTTP requests) into a Ring-format
          ;; map understood by the HTTP client.
          ring-request (request->ring request)
          options (merge default-options ring-request)
          ;; Define the callback used to process the response.
          on-response (fn [response]
                        ;; Extract the body and convert it to edn if we can.
                        (let [content-type (get response :content-type)
                              body (get response :body)
                              data (condp = content-type
                                     "application/json" (from-json body)
                                     ;; If no match, return body unchanged.
                                     body)]
                          ;; TODO convert map keywords (optional?)
                          ;; TODO validate response (optional?)

                          ;; Call the user supplied callback with the
                          ;; response data.
                          (callback data)))
          on-error (fn [e]
                     ;; TODO FIXME Do something better here.
                     (prn (ex-data e)))]
      ;; Returns a net.http.common.MinimalFuture. Any exceptional status
      ;; code will result in the on-error handler being called with an
      ;; ex-info containing the response map.
      (hc/request options on-response on-error))))
