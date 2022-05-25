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
;; This is the definition of the collection of parameters supplied for
;; an RPC request. If a vector of values is supplied, the values are
;; assumed to be in the order defined by the schema's parameter list for
;; the method. If a map of parameters is supplied, the keys are assumed
;; to be the parameter names and the corresponding values are the
;; parameter values.
;;
;; NB: a schema for each parameter may be specified, in which it case it
;; will (eventually) be used to validate the supplied parameter value.

(def params
  [:or
   [:map-of :keyword :any]
   [:vector :any]])
