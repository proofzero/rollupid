(ns com.kubelt.spec.rpc.client
  "An RPC client map."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods])
  (:require
   [com.kubelt.spec.openrpc.server :as spec.openrpc.server]
   [com.kubelt.spec.rpc.init :as spec.rpc.init]
   [com.kubelt.spec.rpc.server :as spec.rpc.server]))

;; http-client
;; -----------------------------------------------------------------------------
;; TODO this should be something that conforms to com.kubelt.proto.http/HttpClient

(def http-client
  :any)

;; prefix
;; -----------------------------------------------------------------------------
;; Every schema used by the client has an associated prefix that is used
;; to namespace it from other schemas in the same client.

(def prefix
  :keyword)

;; schemas
;; -----------------------------------------------------------------------------

;; TODO flesh these specs out to describe the RPC client map that
;; results from the (rpc/init) call.
(def schema-version :string)
(def schema-metadata :map)
(def schema-servers [:vector :any])
(def schema-methods :map)

(def schema
  [:map
   [:rpc/version schema-version]
   [:rpc/metadata schema-metadata]
   [:rpc/servers schema-servers]
   [:rpc/methods schema-methods]])

(def schemas
  [:map-of prefix schema])

(def servers
  [:map-of prefix [:map-of spec.openrpc.server/name spec.rpc.server/server]])

;; client
;; -----------------------------------------------------------------------------
;; An RPC client.

(def client
  [:map
   [:com.kubelt/type [:enum :kubelt.type/rpc.client]]
   [:init/options spec.rpc.init/options]
   [:http/client http-client]
   [:rpc/servers servers]
   [:rpc/schemas schemas]])
