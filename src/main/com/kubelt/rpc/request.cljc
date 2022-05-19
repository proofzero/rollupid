(ns com.kubelt.rpc.request
  "Convert a method description and parameters into a transport (HTTP)
  request map."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.uuid :as lib.uuid]
   [com.kubelt.rpc.path :as rpc.path]))

(defn- http-request
  [body options]
  {:pre [(map? options)]}
  (let [version "1.1"
        ;; All RPC calls use POST.
        method :post
        user-agent (get options :http/user-agent "")
        headers {"Content-Type" "application/json"
                 "User-Agent" user-agent}
        trailers {}
        scheme :http
        domain (:uri/domain options "example.com")
        port (:uri/port options 33337)
        path (:uri/path options "/foo")]
    {:com.kubelt/type :kubelt.type/http-request
     :http/version version
     :http/method method
     :http/headers headers
     :http/trailers trailers
     :http/body body
     :uri/scheme scheme
     :uri/domain domain
     :uri/port port
     :uri/path path}))

;; TODO use an integer stored in client for incrementing counter?
;; Or perhaps a ULID / SQUUID to show calling sequence?
(defn- make-request-id
  "Return a unique request identifier."
  []
  (lib.uuid/random))

(defn- make-body
  [path method]
  {:pre [(rpc.path/path? path) (map? method)]}
  (let [;; Every RPC request must have a unique identifier.
        request-id (make-request-id)
        ;; The version of the JSON-RPC spec that we conform to.
        rpc-version "2.0"
        ;; The original name of the RPC method to call is stored in the
        ;; method map.
        method-name (get method :method/name)
        params []]
    (lib.json/edn->json-str
     {:id request-id
      :jsonrpc rpc-version
      :method method-name
      :params params})))

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
  ([path method params]
   (let [defaults {}]
     (from-method path method params defaults)))

  ([path method params options]
   {:pre [(vector? path) (every? map? [method params options])]}
   ;; TODO allow specification of parameters as a sequence, in which
   ;; case the position of the parameter aligns with the parameter
   ;; definition list in the schema
   ;; TODO allow specification of parameters as a map, in which case the
   ;; map keys correspondond to the method parameter names.
   ;; TODO validate parameters
   (let [body (make-body path method)
         request (http-request body options)]
     {:com.kubelt/type :kubelt.type/rpc.request
      ;; TODO add a :rpc.param/<name> for each param that includes metadata,
      ;; schema, etc.
      ;; TODO add a :rpc.result that describes the expected result.
      :rpc/path path
      :rpc/method method
      :rpc/params params
      :http/request request})))
