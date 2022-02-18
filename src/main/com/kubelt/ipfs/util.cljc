(ns com.kubelt.ipfs.util
  "Utilities for converting API resource description maps into functions
  that accept resource parameters and return resource descriptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli]
   [malli.error]
   [malli.util])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]))

;; Definitions
;; -----------------------------------------------------------------------------

(def default-method
  :post)

;; Internal
;; -----------------------------------------------------------------------------

(defn get-query-params
  "Given a map describing the query parameters allowed for a resource, and
  an options map provided by the caller that supplies those parameters,
  return a map containing HTTP query parameters, or a map describing why
  the given options were invalid."
  [params options]
  (let [param-keys (keys params)
        option-map (select-keys options param-keys)]
    (letfn [(value->str [x]
              ;; Convert a boolean value into canonical string version
              ;; for use in the query map, which expects values to be
              ;; strings.
              (if (boolean? x)
                (str x)
                x))
            (query-value-fn [a k v]
              (let [param-desc (get params k)
                    query-name (get param-desc :name)
                    query-value (get a query-name)]
                ;; Account for the fact that query parameter arguments
                ;; permit repetition of the same key.
                (cond
                  ;; There is not yet any value stored for the given
                  ;; query name.
                  (nil? query-value)
                  (assoc a query-name (value->str v))
                  ;; There is already a vector of values stored for the
                  ;; given query name.
                  (vector? query-value)
                  (update a query-name conj v)
                  ;; A scalar value was stored for the given query name;
                  ;; store a vector of values instead.
                  :else
                  (assoc a query-name [query-value v]))))]
      (reduce-kv query-value-fn {} option-map))))

;; We're given a map that describes the parameters for an API resource:
;;
;; {:param/name
;;  {:name "..."
;;   :description "..."
;;   :required false
;;   :spec []}}
;;
;; We return a malli schema for a map where the parameter name is a
;; permitted key and the permitted value for that key is determined by
;; the supplied schema.
(defn make-param-spec
  "Given the request parameters map, extract the spec for each parameter
  and merge them together into a single schema, returning the result."
  [params body]
  (letfn [(extract-spec [schema param-kw param-map]
            (let [spec (get param-map :spec)
                  param-required? (get param-map :required)
                  ;; Check value of :required and mark value
                  ;; as :optional or not in the schema.
                  value-meta (cond-> {}
                               (not param-required?) (assoc :optional true))
                  value-schema (if-not (empty? value-meta)
                                 [param-kw value-meta spec]
                                 [param-kw spec])]
              (conj schema value-schema)))]
    (let [schema [:map {:closed true}
                  ;; Allow the HTTP request method to be overridden.
                  ;;[:http/method {:optional true} ipfs.spec/http-methods]
                  ;; Allow the HTTP host to be overridden.
                  ;;[:http/host {:optional true} ipfs.spec/http-host]
                  ;; Allow the HTTP port to be overridden.
                  ;;[:http/port {:optional true} ipfs.spec/http-port]

                  ;; Allow a response callback to be provided.
                  ;; NB: by default this on checks that fn? is true.
                  [:on/response {:description "Response callback."
                                 :optional true}
                   [:=> [:cat :map] :any]]
                  ;; Allow an error callback to be provided.
                  ;; NB: by default this on checks that fn? is true.
                  [:on/error {:description "Error callback."
                              :optional true}
                   [:=> [:cat :map] :any]]]
          params+body (merge params body)]
      (reduce-kv extract-spec schema params+body))))

;; TODO conditional JS: check for object and convert to map
(defn ensure-map
  [x]
  (if (map? x)
    x
    #?(:clj (into {} x)
       :cljs (js->clj x :keywordize true))))

;; Public
;; -----------------------------------------------------------------------------

(defn make-http
  "Take a resource descriptor map that describes an IPFS RESTful API
  endpoint and convert it into a function. The returned function accepts
  a map of parameters for the API call, as well as additional base
  parameter that can be overridden, e.g. host name/port, and returns a
  description of the HTTP request to perform. The returned map includes
  schemas for the input parameters and the expected HTTP response that
  are used to validate data and to transform it from one format to
  another."
  [base method]
  {:pre [(every? map? [base method])]}
  (if-not (malli/validate ipfs.spec/api-base base)
    (let [error (-> ipfs.spec/api-base (malli/explain base) malli.error/humanize)]
      (throw (ex-info "invalid api base configuration" error))))
  (if-not (malli/validate ipfs.spec/api-resource method)
    ;; Return a human-readable explanation of the schema failure.
    (let [error (-> ipfs.spec/api-resource (malli/explain method) malli.error/humanize)]
      (throw (ex-info "invalid resource configuration" error))))
  ;; Return a fn that validates API resource parameters and returns a
  ;; configuration map for making the corresponding HTTP request and
  ;; parsing the response.
  (let [resource-desc (get method :resource/description)
        resource-methods (get method :resource/methods)
        request-path (str (get base :path/prefix)
                          (get method :resource/path))
        request-params (get method :resource/params)

        ;; This is the map that describes the option that contains the
        ;; data to be sent in the request body (if any).
        request-body (get method :resource/body {})
        ;; The parameter containing body data (if any) is the only key
        ;; within in the :resource/body map.
        body-param (first (keys request-body))
        ;; We need the name of the body parameter to use when sending
        ;; e.g. multipart/form-data.
        body-name (:name (first (vals request-body)))

        ;; If present, this function should be applied to the request
        ;; body data supplied by the user to turn it into a form
        ;; suitable for our HTTP client, e.g. a sequence of maps for
        ;; multipart form data.
        resource-body-fn (get method :resource/body-fn)
        ;; An optional function for processing the response body.
        response-body-fn (get method :response/body-fn)

        request-conflicts (get method :resource/conflicts [])
        response-types (get method :response/types)
        response-spec (get method :response/spec)
        ;; Merge specs for the parameters into a single schema that we
        ;; use to validate the input options map. Also include the
        ;; parameter that describes what is expected in request body.
        parameter-spec (make-param-spec request-params request-body)]
    ;; Return a function that accepts an options map for the API
    ;; request, and returns the resource descriptor updated to include
    ;; an HTTP request map that can be passed to our HTTP client for
    ;; invocation.
    (fn ipfs-method
      ([]
       (ipfs-method {}))
      ([options]
       (let [;; If options is a JS object, convert to map.
             options (ensure-map options)]
         ;; Validate the input options using parameter schema.
         (if-not (malli/validate parameter-spec options)
           (let [explain (-> parameter-spec
                             (malli/explain options)
                             malli.error/humanize)]
             {:com.kubelt/type :kubelt.type/error
              :error explain})
           ;; We have a valid options map, so use it to construct our
           ;; resource configuration map describing an IPFS RESTful API
           ;; resource.
           (let [;; TODO check that request method is in allowed set of
                 ;; request methods (defined in resource map
                 ;; as :resource/methods).
                 request-method (get options :http/method default-method)
                 query-params (get-query-params request-params options)
                 ;; body-param is the keyword key in the options map for
                 ;; the parameter that contains the data that should be
                 ;; sent as the request body. This retrieves that data
                 ;; supplied by the user that should be sent as the
                 ;; request body.
                 body-data (get options body-param)
                 ;; If body-fn exists, turn body data into body
                 ;; using it, otherwise send the body-data as-is.
                 body (if (and resource-body-fn body-data)
                        (resource-body-fn body-name body-data)
                        body-data)
                 ;; Add body to the request map; this is the map that
                 ;; tells the HTTP client what request to perform.
                 request (cond->
                             {:com.kubelt/type :kubelt.type/http-request
                              :http/method request-method
                              :uri/path request-path
                              :uri/query query-params}
                           ;; If a request body was provided, add it to
                           ;; the request map.
                           (some? body)
                           (assoc :http/body body))
                 resource {:com.kubelt/type :kubelt.type/api-resource
                           :resource/description resource-desc
                           :resource/methods resource-methods
                           :resource/path request-path
                           :resource/params request-params
                           :resource/conflicts request-conflicts
                           :resource/body request-body
                           :response/types response-types
                           :response/spec response-spec
                           :parameter/spec parameter-spec
                           :parameter/data options
                           :http/request request}]
             (cond-> resource
               ;; Attach response body processing function, if defined.
               (fn? response-body-fn)
               (assoc :response/body-fn response-body-fn)
               ;; Include the response callback, if supplied.
               (contains? options :on/response)
               (assoc :on/response (get options :on/response))
               ;; Include the error callback, if supplied.
               (contains? options :on/error)
               (assoc :on/error (get options :on/error))))))))))
