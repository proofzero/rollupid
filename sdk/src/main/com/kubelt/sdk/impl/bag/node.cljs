(ns com.kubelt.sdk.impl.bag.node
  "Defines the nodes that are stored in a BAG and which map onto IPLD CAR
  blocks."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.impl.bag.check :as bag.check]
   [com.kubelt.sdk.impl.ipld :as ipld]))

;; Each node contains:
;; - data; a CLJS value. Should we require this to be a collection (map, vec)?
;;   when codec is "raw" this data should already be serialized
;; - codec; the codec to use in serializing the data into a block
;;   defined as a keyword that must be mapped into an existing codec
;; - hasher; the hash function to use to summarize the data
;;   defined as a keyword that must be mapped into an existing hash fn
(defn make-node
  "Construct a DAG node that stores the given data."
  ([dag data]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]
    :post [(bag.check/node? %)]}
   (let [ipld-keys [:ipld/codec :ipld/hash]
         options (select-keys dag ipld-keys)]
     (make-node dag data options)))
  ([dag data options]
   {:pre [(bag.check/dag? dag) (map? options)]
    :post [(bag.check/node? %)]}
   (let [ipld-keys [:ipld/codec :ipld/hash]
         defaults (select-keys dag ipld-keys)
         options (merge defaults (select-keys options ipld-keys))]
     (merge options
            {:kubelt/type :kubelt.type/node
             :kubelt.node/dag dag
             :kubelt.node/data data
             :kubelt.node/child []}))))

(defn data
  "Returns the data associated with the node."
  [n]
  {:pre [(bag.check/node? n)]}
  (:kubelt.node/data n))

(defn children
  "Returns a vector of the node's child nodes."
  [n]
  {:pre [(bag.check/node? n)]}
  (:kubelt.node/child n))

(defn leaf?
  "Returns true if this node has no children, false otherwise."
  [n]
  (empty? (:kubelt.node/child n)))

(defn builder
  "Returns a function that can be used to build nodes belonging to the
  given DAG. The resulting nodes are turned into IPLD blocks using the
  given codec and hashing methods."
  ([dag]
   {:pre [(bag.check/dag? dag)]}
   (fn [data]
     {:pre [(bag.check/data? data)]
      :post [(bag.check/node? %)]}
     (make-node dag data)))
  ([dag options]
   {:pre [(bag.check/dag? dag) (map? options)]}
   (fn [data]
     {:pre [(bag.check/data? data)]
      :post [(bag.check/node? %)]}
     (make-node dag data options))))

(defn cbor-node
  "Returns a DAG node that uses the DAG-CBOR codec."
  ([dag data]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-cbor}]
     (make-node dag data options)))
  ([dag data options]
   {:pre [(bag.check/dag? dag) (bag.check/data? data) (map? options)]}
   (let [options (merge options {:ipld/codec ipld/codec-cbor})]
     (make-node dag data options))))

(defn json-node
  "Returns a DAG node that uses the DAG-JSON codec."
  ([dag data]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-json}]
     (make-node dag data options)))
  ([dag data options]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]}
   (let [options (merge options {:ipld/codec ipld/codec-json})]
     (make-node dag data options))))

(defn raw-node
  "Returns a DAG node that uses the raw codec."
  ([dag data]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-raw}]
     (make-node dag data options)))
  ([dag data options]
   {:pre [(bag.check/dag? dag) (bag.check/data? data)]}
   (let [options (merge options {:ipld/codec ipld/codec-raw})]
     (make-node dag data options))))
