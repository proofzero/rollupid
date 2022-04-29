(ns com.kubelt.spec.rpc
  "A schema for RPC client configuration."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods]))

;; url
;; -----------------------------------------------------------------------------

(def url
  :string)

;; path
;; -----------------------------------------------------------------------------
;; RPC calls as defined in an OpenRPC schema are strings. We prefer to
;; use a vector of keywords, which we get by breaking apart the call
;; name at each underscore and converting the resulting strings to
;; keywords.

(def path
  [:vector :keyword])

;; params
;; -----------------------------------------------------------------------------

(def params
  ;; TODO
  :map)

;; client
;; -----------------------------------------------------------------------------
;; An RPC client.

;; TODO flesh these specs out to describe the RPC client map that
;; results from the (rpc/init) call.
(def version :string)
(def metadata :map)
(def servers [:vector :any])
(def methods :map)
(def url :string)

(def client
  [:map
   [:com.kubelt/type [:enum :kubelt.type/rpc.client]]
   [:rpc/version version]
   [:rpc/metadata metadata]
   [:rpc/servers servers]
   [:rpc/methods methods]
   [:rpc/url url]])
