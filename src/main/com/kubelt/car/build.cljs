(ns com.kubelt.car.build
  "Build Content Archives."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["@ipld/dag-cbor" :as codec-cbor]
   ["@ipld/dag-json" :as codec-json]
   ["multiformats/codecs/raw" :as codec-raw :refer [TextEncoder]]
   ["multiformats/hashes/sha2" :as hashes.sha2])
  (:require
   [com.kubelt.car.block :as car.block]
   [com.kubelt.lib.bag.check :as bag.check]
   [com.kubelt.lib.ipld :as ipld]
   [com.kubelt.lib.promise :as promise]))


(defn- kw->codec
  "Maps from a keyword to an IPLD codec implementation that can be used to
  encode a block."
  [kw]
  {:pre [(some #{kw} ipld/supported-codecs)]}
  (condp = kw
    :ipld.codec/raw codec-raw
    :ipld.codec/cbor codec-cbor
    :ipld.codec/json codec-json))

(defn- kw->hasher
  "Maps from a keyword to a hash implementation that will be used to
  summarize the contents of a block."
  [kw]
  {:pre [(some #{kw} ipld/supported-hashers)]}
  (condp = kw
    ;; TODO support more hashes
    ;;:ipld.hash/blake3-256 hashes/blake3
    :ipld.hasher/sha2-256 hashes.sha2/sha256))

(defn- node->block
  "Convert a DAG node into a block. The :ipld/codec and :ipld/hasher
  fields of the node determine the block encoding."
  [{:keys [ipld/codec ipld/hasher kubelt.node/data] :as node}]
  {:pre [(bag.check/node? node)]}
  (let [encoder (kw->codec codec)
        hasher (kw->hasher hasher)
        ;; The encoder is a function that can turn Clojure data into
        ;; IPLD blocks. This function accepts a data value and returns a
        ;; promise that resolves to the encoded block.
        encoder-fn (car.block/encoder encoder hasher)

        ;; TODO FIXME if no children (a leaf node), nothing to do. If
        ;; there are children then must be replaced by their CIDs and
        ;; folded into the node data.
        ;;data (if (seq? children) {:data data :children [:fixme]} data)
        ]
    (encoder-fn data)))

;; TODO write spec for car map
;; TODO test me
(defn- dag->blocks
  "Convert a DAG into a block map. Returns a promise that resolves when
  all of the nodes in the DAG have been converted. The resolved is a map
  has a :root key whose value is the CID of the root block, and a
  sequence of blocks stored as the value of the :blocks key."
  [dag]
  {:pre [(bag.check/dag? dag)]}
  (let [;; TEMP
        blocks-ps [(node->block (:kubelt.dag/root dag))]]
    (-> (promise/all blocks-ps)
        (promise/then
         (fn [blocks]
           (let [root-block (first blocks)
                 root-cid (car.block/block->cid root-block)]
             {:root root-cid :blocks blocks}))))))

;; Public
;; -----------------------------------------------------------------------------

(defn car?
  [x]
  (and
   (map? x)
   (= :kubelt.car/car (:kubelt/type x))))

(defn car
  "Convert a BAG into a map that contains the sequence of blocks to be
  stored in the CAR, and a sequence of block roots. Note that not every
  block is a root. This mirrors the structure of the CAR and makes it a
  straightforward procedure to generate a CAR on disk."
  [bag]
  {:pre [(bag.check/bag? bag)] :post [(promise/promise? %)]}
  (let [dag-set (get bag :kubelt.bag/dag)
        ;; Returns a collection of promises.
        blocks-ps (map dag->blocks dag-set)]
    (-> (promise/all blocks-ps)
        (promise/then
         (fn [block-maps]
           (let [blocks (mapcat :blocks block-maps)
                 roots (map :root block-maps)]
             {:kubelt/type :kubelt.car/car
              :kubelt.car/blocks blocks
              :kubelt.car/roots roots}))))))
