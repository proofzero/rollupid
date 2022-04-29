(ns com.kubelt.spec.rpc.init
  "Schemas related to RPC client (init) function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; TODO re-use existing HTTP client definition
(def http-client
  :map)

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client (init) function.

;; TODO
(def options
  [:map
   [:http/client {:optional true} http-client]])
