(ns com.kubelt.spec.rpc.available
  "Schemas related to the rpc/methods function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; options
;; -----------------------------------------------------------------------------
;; The options map that can be passed to the RPC client (methods) function.

(def options
  [:map
   [:methods/sort? {:optional true} :boolean]
   [:methods/depth {:optional true} nat-int?]
   [:methods/search {:optional true} :string]])
