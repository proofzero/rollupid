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
        domain "example.com"
        port 33337
        path "/foo"]
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

(defn- make-body
  [path method]
  {:pre [(rpc.path/path? path) (map? method)]}
  (let [;; TODO use an integer stored in client for incrementing counter?
        ;; Or perhaps a ULID / SQUUID to show calling sequence?
        request-id (lib.uuid/random)
        rpc-version "2.0"
        ;; This is the name of the RPC method to call.
        ;; TODO look up original string version of method name using
        ;; path as key. These should be stored during initialization.
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
  return an description of the RPC request to perform. The
  stored :rpc/path is the 'path' that names the RPC method, and the
  'options' map is the same as that passed to the (init) call to
  initialize a client, values from which may be used in the process of
  create the request, e.g. a user agent string. The :http/request value
  is an HTTP request map that is used to invoke the RPC call."
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
