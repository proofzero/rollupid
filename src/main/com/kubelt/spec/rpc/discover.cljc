(ns com.kubelt.spec.rpc.discover
  "Schemas related to com.kubelt.rpc/discover function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; url
;; -----------------------------------------------------------------------------
;; The init call takes a provider URL (RPC endpoint) as a parameter.

(def url
  :string)

;; options
;; -----------------------------------------------------------------------------
;; Describes the options that may be passed to the (discover) function
;; that performs OpenRPC schema discovery and injects the fetched schema
;; into an RPC client.

(def options
  :map)
