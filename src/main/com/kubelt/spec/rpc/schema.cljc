(ns com.kubelt.spec.rpc.schema
  "Schemas related to the com.kubelt.rpc/schema function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc :as spec.openrpc]))

;; schema
;; -----------------------------------------------------------------------------
;; Defines the schema for an OpenRPC document that has been loaded from
;; JSON and parsed into edn data.

(def schema
  spec.openrpc/root)

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client (request) function.

(def options
  ;; TODO
  :map)
