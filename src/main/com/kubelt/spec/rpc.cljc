(ns com.kubelt.spec.rpc
  "A schema for RPC client configuration."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; path
;; -----------------------------------------------------------------------------
;; RPC calls as defined in an OpenRPC schema are strings. We prefer to
;; use a vector of keywords, which we get by breaking apart the call
;; name at each underscore and converting the resulting strings to
;; keywords. Converting to structured data makes them nicer to
;; manipulate when we want to do things like adding a prefix.

(def path
  [:vector :keyword])

;; params
;; -----------------------------------------------------------------------------
;; This is the definition of the parameter map for an RPC request. This
;; is a basic check, but a more detailed parameter map schema for a
;; specific call lives inside the client as part of the transformed
;; schema.

(def params
  ;; TODO
  :map)
