(ns com.kubelt.spec.rpc.execute
  "Schemas related to the com.kubelt.rpc/execute function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.rpc.init :as spec.rpc.init]
   [com.kubelt.spec.rpc.request :as spec.rpc.request]))

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client (execute) function.

(def options
  [:map
   [:request/id {:optional true} spec.rpc.request/id]
   [:rpc/jwt {:optional true} spec.rpc.init/jwt]
   [:rpc/timeout {:optional true} spec.rpc.init/timeout]])
