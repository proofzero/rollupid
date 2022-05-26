(ns com.kubelt.rpc.schema
  "Tools for working with OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error :refer [conform*] :refer-macros [conform*]]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.request :as rpc.request]
   [com.kubelt.rpc.schema.fs :as rpc.schema.fs]
   [com.kubelt.rpc.schema.parse :as rpc.schema.parse]
   [com.kubelt.spec.rpc.client :as spec.rpc.client]
   [com.kubelt.spec.rpc.discover :as spec.rpc.discover]
   [com.kubelt.spec.rpc.github :as spec.rpc.github]
   [com.kubelt.spec.rpc.http :as spec.rpc.http]
   [com.kubelt.spec.rpc.inflate :as spec.rpc.inflate]
   [com.kubelt.spec.rpc.schema :as spec.rpc.schema]))

;; schema
;; -----------------------------------------------------------------------------

(defn schema
  "Load a pre-parsed schema into the RPC client."
  ([client schema-doc]
   (let [prefix ::default]
     (schema client prefix schema-doc)))

  ([client prefix schema-doc]
   (let [defaults {}]
     (schema client prefix schema-doc defaults)))

  ([client prefix schema-doc options]
   (conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.schema/schema schema-doc]
    [spec.rpc.schema/options options]
    ;; TODO check options for separator, e.g. ".", "_" (use regex? set of chars?)
    (let [defaults {}
          options (merge defaults options)
          ;; Analyze schema and convert to client map.
          parsed-schema (rpc.schema.parse/parse schema-doc options)]
      (if (lib.error/error? parsed-schema)
        parsed-schema
        (assoc-in client [:rpc/schemas prefix] parsed-schema))))))

;; inflate
;; -----------------------------------------------------------------------------
;; TODO rework to use guards
;; TODO handle promise/future

(defn inflate
  "Load an OpenRPC schema document from the filesystem and use it to
  initialize the RPC client."
  ([client filename]
   (let [prefix ::default]
     (inflate client prefix filename)))

  ([client prefix filename]
   (let [defaults {}]
     (inflate client prefix filename defaults)))

  ([client prefix filename options]
   (conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.inflate/filename filename]
    [spec.rpc.inflate/options options]
    (let [;; This is an edn value representing the schema, if
          ;; successful, but will be an error map if an issue occurred.
          schema-doc (rpc.schema.fs/read-schema filename)]
      (if (lib.error/error? schema-doc)
        schema-doc
        ;; Inject the loaded schema into the client.
        (let [defaults {}
              options (merge defaults options)]
          (schema client prefix schema-doc options)))))))

;; discover
;; -----------------------------------------------------------------------------

(defn discover
  "Given a provider URL, fetch the schema document using the standard
  OpenRPC discovery process (via an rpc.discover call)."
  ([client url]
   (let [prefix ::default]
     (discover client prefix url)))

  ([client prefix url]
   (let [defaults {}]
     (discover client prefix url defaults)))

  ([client prefix url options]
   (conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.discover/url url]
    [spec.rpc.discover/options options]

    ;; TODO option :rpc/jwt (to perform rpc.discover call)

    ;; - Save the base URL into client; when referring to URL in a
    ;;   Server block, it may be defined relative to the base URL (or it
    ;;   might be absolute)

    ;; prepare an rpc.discover request
    ;; execute request
    ;; extract schema from result
    ;; inject a Server entry (if missing)
    ;; update client by calling (schema)

    (let [;; TEMP
          schema-doc {:openrpc "1.2.6", :methods [], :info {:title "", :version "1.0.0"}}
          ;; Construct a fake server object for now
          server {:name "localhost"
                  :url "http://localhost:8787/@0x4d38b2ccaed021d60a6161deac5fbd2641916064/jsonrpc"
                  ;; Map from string (server variable name) to ServerVariable object
                  ;; TODO use URL templates to construct final URL
                  :variables {}}
          ;; We concoct a description of an rpc.discover call as though
          ;; it were described in an OpenRPC schema. This lets us use
          ;; the same machinery for performing the RPC call as used for
          ;; standard API calls.
          ;; TODO add description of expected result (a schema).
          method {:method/name "rpc.discover"
                  :method/params {}
                  :method.params/all []
                  :method.params/required []
                  :method.params/optional []
                  :method.params/schemas {}}
          ;; This call takes takes no parameters.
          params {}
          ;;
          options (merge (get client :init/options {}) options)
          ;; Prepare a request map for the standard rpc.discover
          ;; call.
          request (rpc.request/from-method server method params options)
          ;;result (rpc/execute client request)
          ]
      request
      ;;(schema client prefix schema-doc options)
      ))))

(comment
  (def rpc-url "http://localhost:8787/@0x4d38b2ccaed021d60a6161deac5fbd2641916064/jsonrpc")
  )

;; http
;; -----------------------------------------------------------------------------

(defn http
  "Fetch a schema document from the given URL and load it into the
  client."
  ([client url]
   (let [prefix ::default]
     (http client prefix url)))

  ([client prefix url]
   (let [defaults {}]
     (http client prefix url defaults)))

  ([client prefix url options]
   (conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.http/url url]
    [spec.rpc.http/options options]
    :fixme
    )))

;; github
;; -----------------------------------------------------------------------------

(defn github
  "Fetch a schema document from a GitHub repository and load it into the
  client."
  ([client repo]
   (let [prefix ::default]
     (github client prefix repo)))

  ([client prefix repo]
   (let [defaults {}]
     (github client prefix repo defaults)))

  ([client prefix repo options]
   (conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.github/repo repo]
    [spec.rpc.github/options options]
    :fixme
    )))
