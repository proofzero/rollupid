(ns com.kubelt.spec.openrpc.link
  "A schema for an OpenRPC Link object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]
   [com.kubelt.spec.openrpc.runtime :as openrpc.runtime]
   [com.kubelt.spec.openrpc.server :as openrpc.server]))


(def name
  :string)

(def description
  :string)

(def summary
  :string)

(def method
  :string)

(def params
  [:map-of :string [:or openrpc.runtime/expression :any]])

;; Link
;; -----------------------------------------------------------------------------

(def link
  [:map
   {:closed true
    :description "A Link object represents a possible design-time link
for a result. The presence of a link does not guarantee the caller's
ability to successfully invoke it, rather it provides a known
relationship and traversal mechanism between results and other methods.

Unlike *dynamic* links (i.e. links provided in the result payload), the
OpenRPC linking mechanism does not require link information in the
runtime result.

For computing links, and providing instructions to execute them, a
runtime expression is used for accessing values in a method and useing
them as parameters while invoking the linked method."}

   [:name
    {:description "Canonical name of the link."}
    name]

   [:description
    {:optional true
     :description "A description of the link."}
    description]

   [:summary
    {:optional true
     :description "Short description for the link."}
    summary]

   [:method
    {:optional true
     :description "The name of an *existing*, resolvable OpenRPC method,
as defined with a unique 'method'. This field MUST resolve to a unique
Method object. As opposed to OpenAPI, relative 'method' values ARE NOT
permitted."}
    method]

   [:params
    {:optional true
     :description "A map representing parameters to pass to a method as
specified with 'method'. The key is the parameter name to be used,
whereas the value can be a constant or a runtime expression to be
evaluated and passed to the linked method."}
    params]

   [:server
    {:optional true
     :description "A Server object to be used by the target method."}
    openrpc.server/server]])

;; [Link]
;; -----------------------------------------------------------------------------

(def links
  [:vector [:or openrpc.reference/reference link]])
