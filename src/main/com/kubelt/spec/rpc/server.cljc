(ns com.kubelt.spec.rpc.server
  "Common options for specifying a server to execute an RPC against."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.server :as spec.openrpc.server]))

;; name
;; -----------------------------------------------------------------------------
;; This is the name of a Server configuration map in an OpenRPC schema.
;; When preparing an RPC request for execution, one of the available
;; server backends must be selected (if there is more than one) by name.

(def name
  spec.openrpc.server/name)

(def name-entry
  [:server/name {:optional true} name])

;; random?
;; -----------------------------------------------------------------------------
;; Rather than picking a specific server, set this flag to enable the
;; selection of one of the available servers at random.

(def random?
  :boolean)

(def random?-entry
  [:server/random? {:optional true} random?])

;; server
;; -----------------------------------------------------------------------------

(def server
  spec.openrpc.server/server)
