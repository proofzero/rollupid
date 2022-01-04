(ns com.kubelt.sdk.spec.bag
  "Defines a spec for the kubelt BAG (Bundle of Acyclic Graphs) type."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m])
  (:require
   [com.kubelt.sdk.impl.ipld :as ipld]))

;; Data
;; -----------------------------------------------------------------------------
;; This is the data that is allowed to be associated with a node.

(def data
  [:or map? vector?])

;; Node
;; -----------------------------------------------------------------------------

(def node
  [:map
   [:kubelt/type [:enum :kubelt.type/node]]
   ;; TODO store reference to parent dag?
   ;;[:kubelt.node/dag dag]
   ;; TODO enumerate allowed keywords
   [:kubelt.node/codec {:optional true} :qualified-keyword]
   ;; TODO enumerate allowed keywords
   [:kubelt.node/hash {:optional true} :qualified-keyword]
   [:kubelt.node/data data]
   ;; TODO this should be recursive
   [:kubelt.node/child vector? #_[:vector node]]])

(def node-schema
  [:and
   {:name "Node"
    :description "A BAG node"
    :example {}}
   node])

;; DAG
;; -----------------------------------------------------------------------------

(def dag
  [:map
   [:kubelt/type [:enum :kubelt.type/dag]]
   ;; TODO store reference to parent bag?
   ;;[:dag/bag bag]
   [:kubelt.dag/root {:optional true} node]
   ;; TODO enumerate allowed keywords
   [:ipld/codec {:optional true} :qualified-keyword]
   ;; TODO enumerate allowed keywords
   [:ipld/hash {:optional true} :qualified-keyword]])

(def dag-schema
  [:and
   {:name "DAG"
    :description "A BAG directed acyclic graph"
    :example {}}
   dag])

;; BAG
;; -----------------------------------------------------------------------------

(def bag
  [:map
   [:kubelt/type [:enum :kubelt.type/bag]]
   [:kubelt.bag/dag [:set dag]]
   ;; TODO enumerate allowed keywords
   [:ipld/codec :qualified-keyword]
   ;; TODO enumerate allowed keywords
   [:ipld/hash :qualified-keyword]])

(def bag-schema
  [:and
   {:name "BAG"
    :description "A bundle of acyclic graphs"
    :example {}}
   bag])
