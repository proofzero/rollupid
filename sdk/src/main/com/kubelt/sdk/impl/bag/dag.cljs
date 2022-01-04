(ns com.kubelt.sdk.impl.bag.dag
  "Defines the DAGs that are stored in a BAG."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.impl.bag.check :as bag.check]))


(defn make-dag
  "Returns an empty DAG using the same defaults as the provided BAG. If an
  options map is provided, the keys :hash and :codec can be used to
  override the default hashing algorithm and codec used to construct the
  corresponding IPLD block. NB: the DAG has no root node until one is set."
  ([bag]
   {:pre [(bag.check/bag? bag)]}
   (let [options {:ipld/codec (:ipld/codec bag)
                  :ipld/hash (:ipld/hash bag)}]
     (merge options
            {:kubelt/type :kubelt.type/dag
             :kubelt.dag/bag bag})))
  ([bag options]
   {:pre [(bag.check/bag? bag) (map? options)]}
   (let [ipld-keys [:ipld/codec :ipld/hash]
         defaults (select-keys bag ipld-keys)
         options (select-keys (merge defaults options) ipld-keys)]
     (merge options
            {:kubelt/type :kubelt.type/dag
             :kubelt.dag/bag bag}))))

(defn builder
  "Return a function that can be used to build DAGs belonging to the given
  BAG. If the codec and hash arguments are provided they will override
  the default options set in the BAG."
  ([bag]
   {:pre [(bag.check/bag? bag)]}
   (fn []
     (make-dag bag)))
  ([bag options]
   {:pre [(bag.check/bag? bag) (map? options)]}
   (fn []
     (make-dag bag options))))

(defn set-root
  "Set a node as the root of a DAG and returns the updated DAG."
  [dag node]
  {:pre [(bag.check/dag? dag) (bag.check/node? node)]}
  (assoc dag :kubelt.dag/root node))
