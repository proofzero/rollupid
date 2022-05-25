(ns com.kubelt.spec.openrpc.component
  ""
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.openrpc.content :as openrpc.content]
   [com.kubelt.spec.openrpc.error :as openrpc.error]
   [com.kubelt.spec.openrpc.example :as openrpc.example]
   [com.kubelt.spec.openrpc.link :as openrpc.link]
   [com.kubelt.spec.openrpc.pairing :as openrpc.pairing]
   [com.kubelt.spec.openrpc.schema :as openrpc.schema]
   [com.kubelt.spec.openrpc.tag :as openrpc.tag]))


(def errors
  [:map-of :keyword openrpc.error/error])

(def pairing
  [:map-of :keyword openrpc.pairing/example])

(def tags
  [:map-of :keyword openrpc.tag/tag])

(def links
  [:map-of :keyword openrpc.link/link])

(def schemas
  [:map-of :keyword openrpc.schema/schema])

(def examples
  [:map-of :keyword openrpc.example/example])

;; Components
;; -----------------------------------------------------------------------------

(def components
  [:map
   {:closed true
    :description "An element to hold various schemas for the
specification."}

   [:content-descriptors
    {:optional true
     :description "An object to hold reusable Content Descriptor
objects."}
    openrpc.content/descriptors]

   [:schemas
    {:optional true
     :description "An object to hold reusable Schema objects."}
    schemas]

   [:examples
    {:optional true
     :description "An object to hold reusable Example objects."}
    examples]

   [:links
    {:optional true
     :description "An object to hold reusable Link objects."}
    links]

   [:errors
    {:optional true
     :description "An object to hold reusable Error objects."}
    errors]

   [:example-pairing-objects
    {:optional true
     :description "An object to hold reusable Example Pairing objects."}
    pairing]

   [:tags
    {:optional true
     :description "An object to hold reusable Tag objects."}
    tags]])
