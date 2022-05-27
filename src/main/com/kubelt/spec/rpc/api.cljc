(ns com.kubelt.spec.rpc.api
  "Schemas related to the com.kubelt.rpc/api function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; options
;; -----------------------------------------------------------------------------
;; The options map that can be passed to the (com.kubelt.rpc/api)
;; function that is used to explore the collection of API methods
;; available via an RPC client.

(def options
  [:map
   [:methods/sort? {:optional true} :boolean]
   [:methods/depth {:optional true} nat-int?]
   [:methods/search {:optional true} :string]])
