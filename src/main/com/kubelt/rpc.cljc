(ns com.kubelt.rpc
  "Entry point for a JSON-RPC client."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.spec :as spec]
   [com.kubelt.spec.openrpc :as spec.openrpc]
   [com.kubelt.spec.rpc :as spec.rpc]
   [com.kubelt.spec.rpc.call :as spec.rpc.call]
   [com.kubelt.spec.rpc.init :as spec.rpc.init]
   [com.kubelt.spec.rpc.methods :as spec.rpc.methods]
   [com.kubelt.spec.rpc.request :as spec.rpc.request]))

;; Public
;; -----------------------------------------------------------------------------
;; TODO check version of supplied schema to ensure we support it
;; TODO support dynamic extension of client to add another schema (with prefix)

(defn client?
  [x]
  (malli/validate spec.rpc/client x))

(defn path?
  [x]
  (malli/validate spec.rpc/path x))

;; TODO add option to provide set of "dividing" characters, e.g. _, .
;; - "eth_sync" => [:eth :sync]
;; - "rpc.provider" => [:rpc :provider]
;; TODO add option for using a prefix, e.g.
;; {:method/prefix :xxx}
;; - "eth_sync" => [:xxx :eth :sync]
(defn init
  "Create a JSON-RPC client."
  ([url schema]
   (let [defaults {}]
     (init url schema defaults)))
  ([url schema options]
   (lib.error/conform*
    [spec.rpc/url url]
    [spec.openrpc/schema schema]
    [spec.rpc.init/options options]
    (let [;; Returns the schema, if valid, or an error map indicating
          ;; the detected errors.
          schema (rpc.schema/validate schema)]
      (if (lib.error/error? schema)
        schema
        ;; Analyze schema and convert to client map.
        (let [client (rpc.schema/build url schema options)]
          (merge {:com.kubelt/type :kubelt.type/rpc.client} client)))))))

;; The intent of this function is to provide a pleasant REPL-driven
;; developer experience. A user should be able to instantiate or receive
;; a client, and use this method to discover what calls it supports by
;; listing everything, searching/filtering based on various
;; attributes (initially the API call name or "path"), and sorting the
;; output to obtain a single API method name that can be passed to
;; the (doc) function to obtain more detailed documentation as data or
;; possibly in a pretty output format.
(defn methods
  "Return the collection of operations provided by the API. Each vector of
  keywords in the returned collection represents a call that may be
  performed. If a vector of keywords is provided as the 'path' argument,
  it is used as a prefix to filter the set of methods that are
  returned. Use the (doc) function to get a more detailed description of
  a single API resource. The options parameter can be supplied to filter
  or transform the data that is returned."
  ([client]
   (let [path []]
     (methods client path)))
  ([client path]
   (let [defaults {:methods/sort? true}]
     (methods client path defaults)))
  ([client path options]
   (lib.error/conform*
    [spec.rpc/client client]
    [spec.rpc/path path]
    [spec.rpc.methods/options options]
    (let [method-map (get client :rpc/methods [])
          sort? (get options :methods/sort?)
          depth (get options :methods/depth)
          search (get options :methods/search)
          paths (cond-> (keys method-map)
                  ;; depth
                  (and (integer? depth) (>= depth 0))
                  (rpc.schema/filter-depth depth)
                  ;; search
                  (string? search)
                  (rpc.schema/filter-search search)
                  ;; path
                  (not-empty path)
                  (rpc.schema/filter-path path))]
      (if sort?
        (apply sorted-set paths)
        (into #{} paths))))))

(defn doc
  "Given a method path (a vector of keywords) return a map that describes
  it."
  [client path]
  (lib.error/conform*
   [spec.rpc/client client]
   [spec.rpc/path path]
   (let [methods (get client :rpc/methods)]
     (if-not (contains? methods path)
       (let [message {:message "missing method"
                      :method path}]
         (lib.error/error message))
       ;; TODO optionally provide a better formatted version of documentation
       (get methods path)))))

;; WIP
(defn request
  "Return a request map describing the RPC call to perform. The supplied
  parameters are validated against the service schema and an error map
  is returned if any issues are detected."
  [client path params]
  ;; Use lib.error/conform* to ensure that each argument matches
  ;; its schema.
  (lib.error/conform*
   [spec.rpc/client client]
   [spec.rpc/path path]
   [spec.rpc/params params]
   ;; TODO add macro for guards, i.e. to check the results of a
   ;; collection of predicates and return meaningful errors when they
   ;; fail. Maybe something like: (guards [() () ... ()] (body)).
   (if-let [method (get-in client [:rpc/methods path])]
     method
     ;; TODO confirm that path/method exists
     ;; TODO pull method description
     ;; TODO validate params
     (lib.error/error {:message "no such method" :method path}))))

(comment
  (let [resource-desc]
       {:com.kubelt/type :kubelt.type/api-resource
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
        :http/request request}))

;; options:
;; - explicit request ID
;; - override provider URL
(defn call
  "Call an RPC method."
  ([client request]
    (let [defaults {}]
      (call client request defaults)))
  ([client request options]
   (lib.error/conform*
    [spec.rpc/client client]
    [spec.rpc.request/request request]
    [spec.rpc.call/options options]
    ;; Do eeet
   )))

;; TODO is this useful for developers?
(defn rpc-fn
  "Return a function that implements the given RPC call and which accepts
  the expected parameters and returns the expected result."
  [client path]
  (lib.error/conform*
   [spec.rpc/client client]
   [spec.rpc/path path]
   ;; The returned function should invoke the RPC method named by the
   ;; path argument, assuming that it exists on the client.
   ;; - should we require a single parameter map, or allow the user to
   ;;   supply arguments as varargs? [params] vs. [& params]
   (fn [params]
     (let [;; This validates the parameters and returns an error map if
           ;; any issue(s) were detected.
           req-map (request client path params)]
       (if (lib.error/error? req-map)
         req-map
         (call client req-map))))))
