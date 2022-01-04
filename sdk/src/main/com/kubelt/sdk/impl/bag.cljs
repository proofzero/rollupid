(ns com.kubelt.sdk.impl.bag
  "Defines the Bundle of Acyclic Graphs, a data structure representing a
  collection of DAGs that maps onto the IPLD DAG."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.impl.bag.check :as bag.check]
   [com.kubelt.sdk.impl.ipld :as ipld]))

;; Public
;; -----------------------------------------------------------------------------
;; TODO spec for ipld codecs / hashes

(defn make-bag
  "Construct a BAG that uses the provided codec and hash, or the defaults
  if none are provided."
  ;; The 0-arity constructor sets the default hash and codec.
  ([]
   {:post [(bag.check/bag? %)]}
   (let [options {:ipld/codec ipld/default-codec
                  :ipld/hash ipld/default-hash}]
     (merge options {:kubelt/type :kubelt.type/bag
                     :kubelt.bag/dag #{}})))

  ;; The 1-arity constructor accepts an options map that may use the
  ;; keys :ipld/codec and :ipld/hash to override the default codec and
  ;; hash for the BAG.
  ([{:keys [ipld/codec ipld/hash]
     :or {codec ipld/default-codec
          hash ipld/default-hash}}]
   {:pre [(ipld/codec? codec) (ipld/hash? hash)]
    :post [(bag.check/bag? %)]}
   (let [options {:ipld/codec codec
                  :ipld/hash hash}]
     (merge options {:kubelt/type :kubelt.type/bag
                     :kubelt.bag/dag #{}}))))

(defn add-dag
  "Add a DAG to the collection of DAGs stored in a bag. Returns the
  updated BAG."
  [bag dag]
  {:pre [(bag.check/bag? bag) (bag.check/dag? dag)]}
  (update-in bag [:kubelt.bag/dag] conj dag))
