(ns com.kubelt.spec.rpc.servers
  "Schemas related to the (com.kubelt.rpc/servers) function."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.rpc.server :as spec.rpc.server]))

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to the (com.kubelt.rpc/servers) function.

(def options
  [:map
   spec.rpc.server/name-entry
   spec.rpc.server/random?-entry])
