(ns com.kubelt.car.block
  "Block utilities for producing Content Archives"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["multiformats/block" :as block :refer [Block]]
   ["multiformats/cid" :as cid :refer [CID]]))

;; An IPLD Block has the form:
;; {
;;   value: <original data>,
;;   bytes: Uint8Array,
;;   cid: CID(),
;; }

;; Public
;; -----------------------------------------------------------------------------

(defn block->raw
  "Returns the raw data value from a Block."
  [^Block b]
  {:pre [(instance? Block b)]}
  (.-value b))

(defn block->edn
  "Returns the data value from a Block as Clojure data."
  [^Block b]
  {:pre [(instance? Block b)]}
  (js->clj (block->raw b) :keywordize-keys true))

(defn block->bytes
  "Returns the encoded bytes from a Block."
  [^Block b]
  {:pre [(instance? Block b)]}
  (.-bytes b))

(defn block->cid
  "Returns the CID from a Block."
  [^Block b]
  {:pre [(instance? Block b)]}
  (.-cid b))

(defn encoder
  "Returns a function that turns Clojure data into an IPLD block using the
  given codec and hasher implementations. The returned function accepts
  edn data and returns a promise that resolves to the encoded IPLD
  Block."
  [codec hasher]
  (fn [data]
    (let [value (clj->js data)
          options #js {"value" value
                       "codec" codec
                       "hasher" hasher}]
      ;; Returns a promise!
      (.encode block options))))

(defn decoder
  "Returns a function that decodes a block from its binary state without
  performing any validation. The returned function takes an IPLD Block
  instance and returns a promise that resolves to the decoded
  block. Note that no validation of the decoded block is performed. If
  that's a requirement, use (validator) instead."
  [codec hasher]
  (fn [^Block b]
    (let [bytes (.-bytes b)
          options #js {"bytes" bytes
                       "codec" codec
                       "hasher" hasher}]
      ;; Returns a promise!
      (.decode block options))))

(defn validator
  "Returns a function that decodes a block from its binary state,
  validating the results using a given content identifier. The returned
  function takes an IPLD Block instance and a corresponding CID, and
  returns a promise the resolves to the decoded block. If you do not
  require validation of the decoded block, use (decoder) instead."
  [codec hasher]
  (fn [^Block b ^CID cid]
    (let [bytes (.-bytes b)
          options #js {"bytes" bytes
                       "codec" codec
                       "hasher" hasher
                       "cid" cid}]
      ;; Returns a promise!
      (.decode block options))))
