(ns com.kubelt.spec.bag
  "Defines a spec for the kubelt BAG (Bundle of Acyclic Graphs) type."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.ipld :as ipld]))

;; Data
;; -----------------------------------------------------------------------------
;; This is the data that is allowed to be associated with a node.

(def data
  [:or map? vector?])

(def ipld-codec
  `[:enum ~@ipld/supported-codecs])

(def ipld-hasher
  `[:enum ~@ipld/supported-hashers])

;; Node
;; -----------------------------------------------------------------------------

(def node
  [:map
   [:kubelt/type [:enum :kubelt.type/node]]
   [:kubelt.node/data data]
   [:ipld/codec {:optional true} ipld-codec]
   [:ipld/hasher {:optional true} ipld-hasher]])

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
   [:ipld/hasher {:optional true} :qualified-keyword]])

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
   [:ipld/hasher :qualified-keyword]])

(def bag-schema
  [:and
   {:name "BAG"
    :description "A bundle of acyclic graphs"
    :example {}}
   bag])
