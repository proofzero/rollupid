(ns com.kubelt.spec.openrpc.content
  "Defines the schema for an OpenRPC Content Descriptor object. These are
  reusable ways of describing either an RPC parameter or a result."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.schema :as openrpc.schema]))


(def name
  :string)

(def summary
  :string)

(def description
  :string)

(def required
  :boolean)

(def deprecated
  :boolean)

;; Content Descriptor
;; -----------------------------------------------------------------------------

(def descriptor
  [:map
   {:closed true
    :description "A Content Descriptor is a reusable way of describing
either parameters or a result. They MUST have a schema."}

   [:name
    {:description "Name of the content that is being described. If the
content described is a method parameter assignable 'by-name', this field
SHALL define the parameter's key (i.e. name)."}
    name]

   [:schema openrpc.schema/schema]

   [:summary
    {:optional true
     :description "A short summary of the content that is being
 described."}
    summary]

   [:description
    {:optional true
     :description "A verbose explanation of the content descriptor
behaviour."}
    description]

   [:required
    {:optional true
     :description "Determines if the content is a required field. Default
value is false."}
    required]

   [:deprecated
    {:optional true
     :description "Specifies that the content is deprecated and SHOULD be
   transitioned out of usage. Default value is false."
     :default false}
    deprecated]])

;; [Content Descriptor]
;; -----------------------------------------------------------------------------

(def descriptors
  [:and
   {:description "An object to hold reusable Content Descriptor objects."}
   [:map-of :keyword descriptor]])
