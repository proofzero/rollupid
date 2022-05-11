(ns com.kubelt.rpc
  "Entry point for a JSON-RPC client."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.http :as lib.http]
   [com.kubelt.proto.http :as proto.http]
   [com.kubelt.rpc.client :as rpc.client]
   [com.kubelt.rpc.http :as rpc.http]
   [com.kubelt.rpc.path :as rpc.path]
   [com.kubelt.rpc.request :as rpc.request]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.spec :as spec]
   [com.kubelt.spec.openrpc :as spec.openrpc]
   [com.kubelt.spec.rpc :as spec.rpc]
   [com.kubelt.spec.rpc.call :as spec.rpc.call]
   [com.kubelt.spec.rpc.client :as spec.rpc.client]
   [com.kubelt.spec.rpc.doc :as spec.rpc.doc]
   [com.kubelt.spec.rpc.init :as spec.rpc.init]
   [com.kubelt.spec.rpc.methods :as spec.rpc.methods]
   [com.kubelt.spec.rpc.request :as spec.rpc.request]))

;; Public
;; -----------------------------------------------------------------------------
;; TODO check version of supplied schema to ensure we support it
;;
;; TODO support dynamic extension of client to add another schema (with prefix)
;;
;; TODO support taking a map of schemas, with the map keys serving as
;; the prefixes. If the schema map has an :openrpc key it's a schema
;; itself; otherwise we can try assuming that the map is a collection of
;; schemas.
;;
;; TODO rather than injecting a provider URL, use the server URL
;; template feature defined in the OpenRPC spec.

;; TODO add option to provide set of "dividing" characters, e.g. _, .
;; - "eth_sync" => [:eth :sync]
;; - "rpc.provider" => [:rpc :provider]
;;
;; TODO add option for using a prefix, e.g.
;; {:method/prefix :xxx}
;; - "eth_sync" => [:xxx :eth :sync]
;;
;; TODO if user wants to inject an existing HTTP client, should it go
;; into the options map (as things are now) or via a separate
;; parameter (var args, multi-arity).
(defn init
  "Create a JSON-RPC client."
  ([url schema]
   (let [defaults {}]
     (init url schema defaults)))
  ([url schema options]
   (lib.error/conform*
    [spec.rpc.init/url url]
    [spec.openrpc/schema schema]
    [spec.rpc.init/options options]
    ;; TODO url not currently used! It may make sense to use the
    ;; OpenRPC "Server" block to configure RPC endpoints using URL
    ;; templates.
    (let [user-agent (rpc.http/user-agent 0 0 1)
          ;; Create an HTTP client (use the one in the options map, if provided).
          http-client (if-not (contains? options :http/client)
                        (lib.http/client)
                        (:http/client options))
          defaults {:http/user-agent user-agent}
          ;; Remove the HTTP client and use defaults for any option
          ;; values not supplied.
          options (as-> options $
                    (dissoc $ :http/client)
                    (merge defaults $))
          ;; Analyze schema and convert to client map.
          client (rpc.client/from-schema schema options)]
      (-> client
          (assoc :http/client http-client))))))

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
    [spec.rpc.client/client client]
    [spec.rpc/path path]
    [spec.rpc.methods/options options]
    (let [method-map (get client :rpc/methods [])
          sort? (get options :methods/sort?)
          depth (get options :methods/depth)
          search (get options :methods/search)
          paths (cond-> (keys method-map)
                  ;; depth
                  (and (integer? depth) (>= depth 0))
                  (rpc.path/filter-depth depth)
                  ;; search
                  (string? search)
                  (rpc.path/filter-search search)
                  ;; prefix
                  (not-empty path)
                  (rpc.path/filter-prefix path))]
      (if sort?
        (apply sorted-set paths)
        (into #{} paths))))))

(defn doc
  "Given a method path (a vector of keywords) return a map that describes
  it."
  ([client path]
   (let [defaults {}]
     (doc client path defaults)))
  ([client path options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc/path path]
    [spec.rpc.doc/options options]
    (let [methods (get client :rpc/methods)]
      (if-not (contains? methods path)
        (let [message {:message "missing method" :method path}]
          (lib.error/error message))
        ;; TODO optionally provide a better formatted version of documentation
        (get methods path))))))

;; WIP
(defn request
  "Return a request map describing the RPC call to perform. The supplied
  parameters are validated against the service schema and an error map
  is returned if any issues are detected."
  [client path params]
  ;; Use lib.error/conform* to ensure that each argument matches
  ;; its schema.
  (lib.error/conform*
   [spec.rpc.client/client client]
   [spec.rpc/path path]
   [spec.rpc/params params]
   ;; TODO add macro for guards, i.e. to check the results of a
   ;; collection of predicates and return meaningful errors when they
   ;; fail. Maybe something like: (guards [() () ... ()] (body)).
   (if-let [method (get-in client [:rpc/methods path])]
     (let [options (get client :rpc/options)]
       ;; TODO does not yet validate params
       (rpc.request/from-method path method params options))
     (lib.error/error {:message "no such method" :method path}))))

;; options:
;; - explicit request ID
;; - override provider URL
;; - request timeout
(defn call
  "Call an RPC method."
  ([client request]
    (let [defaults {}]
      (call client request defaults)))
  ([client request options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc.request/request request]
    [spec.rpc.call/options options]
    (let [http-client (get client :http/client)
          http-request (get request :http/request)]
      ;; TODO including a request body breaks, fix before performing
      ;; request.
      http-request
      ;; TODO validate result
      ;; :node/browser Returns a promise.
      ;; :jvm Returns a future.
      ;;(proto.http/request! http-client http-request)
      ))))

;; TODO is this useful for developers?
(defn rpc-fn
  "Return a function that implements the given RPC call and which accepts
  the expected parameters and returns the expected result."
  [client path]
  (lib.error/conform*
   [spec.rpc.client/client client]
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
