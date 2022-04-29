(ns com.kubelt.spec.openrpc.reference
  "A schema for an OpenRPC Reference object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

(def $ref
  :string)

;; Reference
;; -----------------------------------------------------------------------------

(def reference
  [:map
   {:closed true
    :description "A simple object to allow referencing other components
in the specification, internally and externally."}

   [:$ref $ref]])
