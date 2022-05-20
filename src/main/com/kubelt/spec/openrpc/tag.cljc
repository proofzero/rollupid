(ns com.kubelt.spec.openrpc.tag
  "A schema for an OpenRPC Tag object."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [name])
  (:require
   [com.kubelt.spec.openrpc.external :as openrpc.external]
   [com.kubelt.spec.openrpc.reference :as openrpc.reference]))


(def name
  :string)

(def summary
  :string)

(def description
  :string)

;; Tag
;; -----------------------------------------------------------------------------

(def tag
  [:map
   {:closed true
    :description "Adds metadata to a single tag that is used by the
Method object. It is not mandatory to have a Tag object per tag defined
in the Method object instances."}

   [:name
    {:description "The name of the tag."}
    name]

   [:summary
    {:optional true
     :description "A short summary of the tag."}
    summary]

   [:description
    {:optional true
     :description "A verbose explanation for the tag."}
    description]

   [:external-docs {:optional true} openrpc.external/docs]])

;; [Tag]
;; -----------------------------------------------------------------------------

(def tags
  [:or openrpc.reference/reference tag])
