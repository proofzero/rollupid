(ns com.kubelt.spec.openrpc.schema
  "A schema for an OpenRPC Schema object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]))


;; TODO
(def json-schema
  :any)

;; Schema
;; -----------------------------------------------------------------------------

(def schema
  [:or
   {:description "Defines the input and output data types. Schema
Objects MUST follow the specifications outlined in the JSON Schema
Specification v7. Alternately, any time a Schema Object can be used, a
Reference Object can be used in its place. This allows referencing
definitions instead of defining them inline."}
   openrpc.reference/reference
   json-schema])
