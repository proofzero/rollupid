(ns com.kubelt.spec.openrpc.pairing
  "Defines the schema for an OpenRPC Example Pairing object that provides
  a set of example parameters and results."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.example :as openrpc.example]
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]))


(def name
  :string)

(def description
  :string)

(def summary
  :string)

(def params
  [:vector [:or openrpc.example/example openrpc.reference/reference]])

(def results
  [:or openrpc.example/example openrpc.reference/reference])

;; Example Pairing
;; -----------------------------------------------------------------------------

(def example
  [:map
   {:closed true
    :description "The Example Pairing object consists of a set of
example params and result. The result is what you can expect from the
JSON-RPC service given the exact params."}

   [:name
    {:optional true
     :description "Name for the example pairing."}
    name]

   [:description
    {:optional true
     :description "A verbose explanation of the example pairing."}
    description]

   [:summary
    {:optional true
     :description "Short description for the example pairing"}
    summary]

   [:params
    {:optional true
     :description "Example parameters."}
    params]

   [:result
    {:optional true
     :description "Example result."}
    results]])

;; [Example Pairing]
;; -----------------------------------------------------------------------------

(def examples
  [:vector example])
