(ns com.kubelt.spec.rpc.client
  "An RPC client map."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [methods])
  (:require
   [com.kubelt.spec.rpc.init :as spec.rpc.init]))

;; client
;; -----------------------------------------------------------------------------
;; An RPC client.

;; TODO flesh these specs out to describe the RPC client map that
;; results from the (rpc/init) call.
(def version :string)
(def metadata :map)
(def servers [:vector :any])
(def methods :map)

(def client
  [:map
   [:com.kubelt/type [:enum :kubelt.type/rpc.client]]
   [:rpc/options spec.rpc.init/options]
   [:rpc/version version]
   [:rpc/metadata metadata]
   [:rpc/servers servers]
   [:rpc/methods methods]])
