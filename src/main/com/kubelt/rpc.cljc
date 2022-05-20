(ns com.kubelt.rpc
  "Entry point for a JSON-RPC client."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.set :as cset])
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
   [com.kubelt.spec.rpc.available :as spec.rpc.available]
   [com.kubelt.spec.rpc.call :as spec.rpc.call]
   [com.kubelt.spec.rpc.client :as spec.rpc.client]
   [com.kubelt.spec.rpc.discover :as spec.rpc.discover]
   [com.kubelt.spec.rpc.doc :as spec.rpc.doc]
   [com.kubelt.spec.rpc.execute :as spec.rpc.execute]
   [com.kubelt.spec.rpc.inflate :as spec.rpc.inflate]
   [com.kubelt.spec.rpc.init :as spec.rpc.init]
   [com.kubelt.spec.rpc.request :as spec.rpc.request]
   [com.kubelt.spec.rpc.schema :as spec.rpc.schema]))

;; TODO check version of supplied schema to ensure we support it

;; TODO rather than injecting a provider URL, use the server URL
;; template feature defined in the OpenRPC spec.

;; init
;; -----------------------------------------------------------------------------
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
;;
;; TODO pass in http client as separate, optional argument rather than
;; including in options map?

(defn init
  "Create a JSON-RPC client."
  ([]
   (let [defaults {}]
     (init defaults)))

  ([options]
   (lib.error/conform*
    [spec.rpc.init/options options]
    ;; TODO Use the OpenRPC "Server" block to configure RPC endpoints
    ;; using URL templates.
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
                    (merge defaults $))]
      (rpc.client/init http-client options)))))

;; available
;; -----------------------------------------------------------------------------
;; The intent of this function is to provide a pleasant REPL-driven
;; developer experience. A user should be able to instantiate or receive
;; a client, and use this method to discover what calls it supports by
;; listing everything, searching/filtering based on various
;; attributes (initially the API call name or "path"), and sorting the
;; output to obtain a single API method name that can be passed to
;; the (doc) function to obtain more detailed documentation as data or
;; possibly in a pretty output format.

(defn available
  "Return the collection of operations provided by the API. Each vector of
  keywords in the returned collection represents a call that may be
  performed. If a vector of keywords is provided as the 'path' argument,
  it is used as a prefix to filter the set of methods that are
  returned. Use the (doc) function to get a more detailed description of
  a single API resource. The options parameter can be supplied to filter
  or transform the data that is returned."
  ([client]
   (let [path []]
     (available client path)))

  ([client path]
   (let [defaults {:methods/sort? true}]
     (available client path defaults)))

  ([client path options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc/path path]
    [spec.rpc.available/options options]
    (let [sort? (get options :methods/sort?)
          depth (get options :methods/depth)
          search (get options :methods/search)
          ;; This is a map from {prefix rpc-schema}. Note that
          ;; rpc-schema is itself a map from "path" (a vector of
          ;; keywords that names an RPC method) to a value that
          ;; describes the method.
          rpc-schemas (get client :rpc/schemas {})
          ;; When no explicit prefix is set, the prefix associated with
          ;; the corresponding schema is ::rpc.schema/default. This is
          ;; to accommodate the common situation where there is only one
          ;; schema being used with the client. In this case we use the
          ;; paths from the schema untouched (not adding the prefix
          ;; keyword to the path vector).
          path-set (reduce
                    (fn [path-set [prefix rpc-schema]]
                      (let [add-prefix (fn [v] (into [prefix] v))
                            paths (into #{} (keys (get rpc-schema :rpc/methods)))
                            paths (if (= prefix ::rpc.schema/default)
                                    paths
                                    (into #{} (map add-prefix paths)))]
                        (cset/union path-set paths)))
                    #{} rpc-schemas)
          ;; Apply the filtering and selection criteria that the caller
          ;; supplied to winnow the results.
          path-set (cond-> path-set
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
        (apply sorted-set path-set)
        path-set)))))

;; doc
;; -----------------------------------------------------------------------------

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
    (let [path-set (available client path)
          path-count (count path-set)]
      ;; Calling (available) returns a set of paths that match a path
      ;; prefix, i.e. [:foo] will match all paths like [:foo ...]. We
      ;; pass a full path so the returned set should have only a single
      ;; entry if the path exists.
      (cond
        ;; Returned path set was empty so the path isn't there.
        (= 0 path-count)
        (let [message {:message "missing method" :method path}]
          (lib.error/error message))
        ;; There's more than one path in the path set, implying we were
        ;; given a partial path prefix and not a full path.
        (> path-count 1)
        (let [message {:message "too many matches" :method path}]
          (lib.error/error message))
        ;; Just one path was in the set, so that's what we'll lookup and
        ;; return documentation for.
        :else
        (letfn []
          (let [method (rpc.client/find-method client path)
                method-raw (get method :method/raw)]
            ;; TODO Support an :output/format option to optionally
            ;; provide alternately formatted versions of documentation.
            method-raw)))))))

;; prepare
;; -----------------------------------------------------------------------------

(defn prepare
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
   (if-let [method (rpc.client/find-method client path)]
     (let [options (get client :init/options)
           ;; If a vector of values was supplied, turn it into a map by
           ;; associating each positional value with its name in the
           ;; schema definition. If a map was supplied, it should be
           ;; from parameter name keyword to parameter value already. In
           ;; either case, validate that we have the correct number of
           ;; parameters.
           ;;
           ;; NB does not yet validate params using JSON Schema definition.
           params (if (vector? params)
                    (rpc.request/from-params-vec method params)
                    (rpc.request/from-params-map method params))]
       ;; TODO check if any of the parameter values are error
       ;; maps. Coalesce into a single error map and return it, if so.
       (if (lib.error/error? params)
         params
         (rpc.request/from-method path method params options)))
     (lib.error/error {:message "no such RPC method" :method path}))))

;; execute
;; -----------------------------------------------------------------------------
;; options:
;; - explicit request ID
;; - override provider URL
;; - request timeout

(defn execute
  "Execute a prepared RPC request."
  ([client request]
    (let [defaults {}]
      (execute client request defaults)))

  ([client request options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc.request/request request]
    [spec.rpc.execute/options options]
    (let [http-client (get client :http/client)
          http-request (get request :http/request)]
      ;; TODO validate result
      ;; :node/browser Returns a promise.
      ;; :jvm Returns a future.
      (proto.http/request! http-client http-request)))))

;; call
;; -----------------------------------------------------------------------------

(defn call
  "Invoke an RPC method. Any error encountered in the supplied parameters
  results in an error map being returned without any request being
  performed."
  ([client path params]
   (let [defaults {}]
     (call client path params defaults)))

  ([client path params options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc/path path]
    [spec.rpc/params params]
    [spec.rpc.call/options options]
    (let [request (prepare client path params)]
      (if (lib.error/error? request)
        request
        (execute client request))))))

;; rpc-fn
;; -----------------------------------------------------------------------------
;; TODO is this useful for developers?

(defn rpc-fn
  "Return a function that implements the given RPC call and which accepts
  the expected parameters and returns the expected result."
  ([client path]
   (let [defaults {}]
     (rpc-fn client path defaults)))

  ([client path options]
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc/path path]
    [spec.rpc.call/options options]
    ;; The returned function should invoke the RPC method named by the
    ;; path argument, assuming that it exists on the client.
    ;; - should we require a single parameter map, or allow the user to
    ;;   supply arguments as varargs? [params] vs. [& params]
    (fn [params]
      ;; This validates the parameters and returns an error map if
      ;; any issue(s) were detected.
      (call client path params options)))))
