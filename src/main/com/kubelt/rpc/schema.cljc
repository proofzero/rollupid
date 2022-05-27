(ns com.kubelt.rpc.schema
  "Tools for working with OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  #?(:browser (:require [com.kubelt.lib.error :as lib.error :refer-macros [conform*]])
     :node (:require [com.kubelt.lib.error :as lib.error :refer-macros [conform*]])
     :clj (:require [com.kubelt.lib.error :as lib.error]))
  (:require
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
   (lib.error/conform*
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
   (lib.error/conform*
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
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.discover/url url]
    [spec.rpc.discover/options options]
    :fixme
    )))

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
   (lib.error/conform*
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
   (lib.error/conform*
    [spec.rpc.client/client client]
    [spec.rpc.client/prefix prefix]
    [spec.rpc.github/repo repo]
    [spec.rpc.github/options options]
    :fixme
    )))
