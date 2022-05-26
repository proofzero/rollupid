(ns com.kubelt.rpc.request
  "Convert a method description and parameters into a transport (HTTP)
  request map."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.uuid :as lib.uuid]
   [com.kubelt.rpc.path :as rpc.path]
   [com.kubelt.rpc.server :as rpc.server]))

(defn- http-request
  [server body options]
  {:pre [(every? map? [server body options])]}
  (let [version "1.1"
        ;; All RPC calls use POST.
        method :post
        headers (merge
                 {"Content-Type" "application/json"}
                 (when-let [user-agent (:http/user-agent options)]
                   {"User-Agent" user-agent})
                 ;; TODO this is kubelt-specific; can we use a more
                 ;; generic way to specify the JWT,
                 ;; e.g. "Authorization:" header, and add an option that
                 ;; allows for the injection of arbitrary header(s)?
                 (when-let [jwt (:rpc/jwt options)]
                   {"KBT-Access-JWT-Assertion" jwt}))
        trailers {}]
    (merge
     {:com.kubelt/type :kubelt.type/http-request
      :http/version version
      :http/method method
      :http/headers headers
      :http/trailers trailers
      :http/body body}
     ;; Converts the Server map into a URI map with the parts of the URI
     ;; are broken up into separate components.
     (rpc.server/uri-map server))))


;; TODO use an integer stored in client for incrementing counter?
;; Or perhaps a ULID / SQUUID to show calling sequence?
(defn- make-request-id
  "Return a unique request identifier."
  []
  (lib.uuid/random))

(defn- adapt-params-shape
  "some rpc methods expect an object instead of an array of args.
  We derive the expectation based on the rpc method specification"
  [method params]
  (if (= "object" (-> method :method/params :params :schema :type))
    (first params)
    params))

(defn- make-body
  [method params]
  {:pre [(every? map? [method params])]}
  (let [;; Every RPC request must have a unique identifier.
        request-id (make-request-id)
        ;; The version of the JSON-RPC spec that we conform to.
        rpc-version "2.0"
        ;; The original name of the RPC method to call is stored in the
        ;; method map.
        method-name (get method :method/name)
        ;; Get the list of keywords representing every parameter
        ;; supported by this RPC method.
        all-params (get method :method.params/all)
        ;; Collect parameters from the supplied parameter map, removing
        ;; any nil entries.
        params (adapt-params-shape method (filter some? (map #(get params %) all-params)))]
    (lib.json/edn->json-forjs-str
     {:id request-id
      :jsonrpc rpc-version
      :method method-name
      :params params})))

;; from-params-map
;; -----------------------------------------------------------------------------
;; Given a map of parameters from keyword parameter name to parameter
;; value, validate that the map has the required parameters and return
;; it if so. Otherwise, return an error map.

(defn from-params-map
  [method params]
  {:pre [(every? map? [method params])]}
  ;; TODO check that all required params were supplied
  ;; TODO Check for extraneous parameters (only if :strict? option enabled)
  (let [;; TODO validate parameter value against schema.
        param-valid? (constantly true)]
    (into {} (map (fn [[param-kw param-val :as pair]]
                    (if-let [param (get-in method [:method/params param-kw])]
                      (let [result (param-valid? param param-val)]
                        (if (lib.error/error? result)
                          [param-kw result]
                          pair))
                      [param-kw (lib.error/error "no such parameter" {:parameter param-kw})]))
                  params))))

;; from-params-vec
;; -----------------------------------------------------------------------------
;; Given a vector of parameter values for a method, and a map describing
;; the method, return a map from parameter name to parameter
;; value. E.g. if the method has parameters [:a :b], and we are given
;; the parameters [:x :y], return {:a :x, :b :y}, or an error map if
;; some error occurred.

(defn from-params-vec
  [method params]
  {:pre [(map? method) (vector? params)]}
  (let [;; A vector of parameter names (as keywords).
        params-kw (get method :method.params/all)
        ;; A map from parameter name to parameter value.
        params-map (zipmap params-kw params)]
    (from-params-map method params-map)))

;; from-method
;; -----------------------------------------------------------------------------

(defn from-method
  "Given a method descriptor map 'method' and a collection of parameters to bind,
  return a description of the RPC request to perform. The
  stored :rpc/path is the 'path' that names the RPC method, and the
  'options' map is the same as that passed to the (init) call to
  initialize a client, values from which may be used in the process of
  creating the request, e.g. a user agent string, an HTTP host name,
  port, or path, etc. The :http/request value is an HTTP request map
  that is used to invoke the RPC call."
  ([server method params]
   (let [defaults {}]
     (from-method server method params defaults)))

  ([server method params options]
   {:pre [(rpc.server/server? server)
          (every? map? [method params options])]}
   (let [body (make-body method params)
         request (http-request server body options)]
     ;; TODO should we merge the method map into the result, rather than
     ;; storing it as the value of the :rpc/method key?
     {:com.kubelt/type :kubelt.type/rpc.request
      ;; TODO add a :rpc.param/<name> for each param that includes metadata,
      ;; schema, etc.
      ;; TODO add a :rpc.result that describes the expected result.
      :rpc/server server
      :rpc/method method
      :rpc/params params
      :http/request request})))
