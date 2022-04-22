(ns com.kubelt.lib.bag
  "Defines the Bundle of Acyclic Graphs, a data structure representing a
  collection of DAGs that maps onto the IPLD DAG."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.bag.check :as bag.check]
   [com.kubelt.lib.bag.dag :as bag.dag]
   [com.kubelt.lib.bag.node :as bag.node]
   [com.kubelt.lib.ipld :as ipld]))

;; Public
;; -----------------------------------------------------------------------------

(defn make-bag
  "Construct a BAG that uses the provided codec and hasher, or the defaults
  if none are provided."
  ;; The 0-arity constructor sets the default hash and codec.
  ([]
   {:post [(bag.check/bag? %)]}
   (let [options {:ipld/codec ipld/default-codec
                  :ipld/hasher ipld/default-hasher}]
     (merge options {:kubelt/type :kubelt.type/bag
                     :kubelt.bag/dag #{}})))

  ;; The 1-arity constructor accepts an options map that may use the
  ;; keys :ipld/codec and :ipld/hasher to override the default codec and
  ;; hash for the BAG.
  ([{:keys [ipld/codec ipld/hasher]
     :or {codec ipld/default-codec
          hasher ipld/default-hasher}}]
   {:pre [(ipld/codec? codec) (ipld/hasher? hasher)]
    :post [(bag.check/bag? %)]}
   (let [options {:ipld/codec codec
                  :ipld/hasher hasher}]
     (merge options {:kubelt/type :kubelt.type/bag
                     :kubelt.bag/dag #{}}))))

(defn add-dag
  "Add a DAG to the collection of DAGs stored in a bag. Returns the
  updated BAG."
  [bag dag]
  {:pre [(bag.check/bag? bag) (bag.check/dag? dag)]}
  (update-in bag [:kubelt.bag/dag] conj dag))

;; TODO test me
;; TODO name isn't great, can do better?
(defn from-json
  "Convert a JSON object into a simple BAG specifying the default codec
  and hasher. The default codec and/or hasher can be overridden by
  supplying a different configuration option in an options map. Use the
  key :ipld/codec or :ipld/hasher to specify the desired codec or hasher,
  respectively."
  ([data]
   {:pre [(object? data)]}
   (let [data (js->clj data :keywordize-keys true)
         node (bag.node/make-node data)
         dag (-> (bag.dag/make-dag)
                 (bag.dag/add-child node))
         bag (-> (make-bag)
                 (add-dag dag))]
     bag))
  ([data options]
   {:pre [(object? data) (map? options)]}
   (let [defaults {:ipld/codec ipld/default-codec
                   :ipld/hasher ipld/default-hasher}
         options (select-keys options [:ipld/codec :ipld/hasher])
         options (merge defaults options)]
     (let [data (js->clj data :keywordize-keys true)
           node (bag.node/make-node data options)
           dag (-> (bag.dag/make-dag)
                   (bag.dag/add-child node))
           bag (-> (make-bag)
                   (add-dag dag))]
       bag))))
