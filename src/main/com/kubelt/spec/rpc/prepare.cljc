(ns com.kubelt.spec.rpc.prepare
  "Schemas related to the com.kubelt.rpc/prepare function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.rpc.request :as spec.rpc.request]
   [com.kubelt.spec.rpc.server :as spec.rpc.server]))

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client
;; com.kubelt.rpc/prepare function.

(def options
  [:map
   [:request/id {:optional true} spec.rpc.request/id]
   spec.rpc.server/name-entry
   spec.rpc.server/random?-entry])
