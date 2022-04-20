(ns com.kubelt.lib.bag.node
  "Defines the nodes that are stored in a BAG and which map onto IPLD CAR
  blocks."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.bag.check :as bag.check]
   [com.kubelt.lib.ipld :as ipld]))

;; Each node contains:
;; - data; a CLJS value. Should we require this to be a collection (map, vec)?
;;   when codec is "raw" this data should already be serialized
;; - codec; the codec to use in serializing the data into a block
;;   defined as a keyword that must be mapped into an existing codec. If
;;   not present, the codec set for the DAG is used instead.
;; - hasher; the hash function to use to summarize the data defined as a
;;   keyword that must be mapped into an existing hash fn. If not set,
;;   the hasher set for the DAG is used instead.
;;
;; TODO add precondition check for validity of provided options.
(defn make-node
  "Construct a DAG node that stores the given data."
  ([data]
   {:pre [(bag.check/data? data)]
    :post [(bag.check/node? %)]}
   (let [options {}]
     (make-node data options)))
  ([data options]
   {:pre [(map? options)]
    :post [(bag.check/node? %)]}
   (let [options (select-keys options [:ipld/codec :ipld/hasher])]
     (merge options
            {:kubelt/type :kubelt.type/node
             :kubelt.node/data data}))))

(defn data
  "Returns the edn data associated with the node."
  [node]
  {:pre [(bag.check/node? node)]}
  (:kubelt.node/data node))

;; TODO add precondition check for validity of provided options.
(defn builder
  "Returns a function that can be used to build nodes using the given IPLD
  codec and hasher. The resulting nodes are turned into IPLD blocks
  using the given codec and hashing methods."
  ([options]
   {:pre [(map? options)]}
   (fn [data]
     {:pre [(bag.check/data? data)]
      :post [(bag.check/node? %)]}
     (make-node data options))))

;; TODO add precondition check for validity of provided options.
(defn cbor-node
  "Returns a DAG node that uses the DAG-CBOR codec."
  ([data]
   {:pre [(bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-cbor}]
     (make-node data options)))
  ([data options]
   {:pre [(bag.check/data? data) (map? options)]}
   (let [options (merge options {:ipld/codec ipld/codec-cbor})]
     (make-node data options))))

;; TODO add precondition check for validity of provided options.
(defn json-node
  "Returns a DAG node that uses the DAG-JSON codec."
  ([data]
   {:pre [(bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-json}]
     (make-node data options)))
  ([data options]
   {:pre [(bag.check/data? data)]}
   (let [options (merge options {:ipld/codec ipld/codec-json})]
     (make-node data options))))

;; TODO add precondition check for validity of provided options.
(defn raw-node
  "Returns a DAG node that uses the raw codec."
  ([data]
   {:pre [(bag.check/data? data)]}
   (let [options {:ipld/codec ipld/codec-raw}]
     (make-node data options)))
  ([data options]
   {:pre [(bag.check/data? data)]}
   (let [options (merge options {:ipld/codec ipld/codec-raw})]
     (make-node data options))))
