(ns com.kubelt.spec.rpc.request
  "Schemas related to RPC requests."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.http :as spec.http]))

;; options
;; -----------------------------------------------------------------------------
;; The options map that may be passed to RPC client (request) function.

(def options
  ;; TODO
  :map)

;; request
;; -----------------------------------------------------------------------------
;; An RPC request map.

;; NB: we re-use the HTTP request map schema.
(def request
  [:map
   [:com.kubelt/type [:enum :kubelt.type/rpc.request]]
   [:http/request   spec.http/request]])
