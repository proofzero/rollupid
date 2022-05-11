(ns com.kubelt.spec.rpc.client
  "An RPC client map."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods]))

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
