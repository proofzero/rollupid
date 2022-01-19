(ns car.block-test
  "Test the encoding and decoding of IPLD blocks."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["multiformats/block" :as block :refer [Block]]
   ["multiformats/cid" :as cid :refer [CID]]
   ["multiformats/codecs/json" :as json]
   ["multiformats/hashes/sha2" :as sha2 :refer [sha256]])
  (:require
   [cljs.core.async :as async :refer [chan go <! >!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str]
   [goog.object])
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.sdk.impl.car.block :as car.block]
   [com.kubelt.sdk.impl.car.build :as car.build]
   [com.kubelt.sdk.impl.ipld :as ipld]))

;; NB: when writing asynchronous tests, use the clojure.test/async macro
;; to create an asynchronous block. The last value returned *must* be
;; the async block.

(deftest block-test
  (let [value {:foo "bar"}
        value-js (clj->js value)
        ;; These are the attributes of a Block.
        bytes (.encode json)
        hash (.digest sha256 bytes)
        cid (.create CID 1 (.-code json) hash)
        ;; Construct a block using known values. Note that the Block
        ;; constructor expects JavaScript data.
        b (Block. #js {"cid" cid
                       "bytes" bytes
                       "value" value-js})]
    (is (= value-js (car.block/block->raw b))
        "raw return value is correct")
    (is (= value (car.block/block->edn b))
        "edn return value is correct")
    (is (= bytes (car.block/block->bytes b))
        "returned bytes are correct")
    (is (= cid (car.block/block->cid b))
        "return cid is correct")))

(deftest encoder-test
  (t/async done
   (go
     (let [codec (car.build/kw->codec ipld/codec-json)
           hasher (car.build/kw->hasher ipld/hasher-sha2-256)
           encoder (car.block/encoder codec hasher)
           data {:foo "bar"}
           b (<p! (encoder data))]
       (is (fn? encoder)
           "encoder is a function")
       (is (instance? Block b)
           "encoder generates a Block")
       (is (= data (car.block/block->edn b))
           "block has expected data")
       (done)))))

(deftest decoder-test
  (t/async done
   (go
     (let [codec (car.build/kw->codec ipld/codec-json)
           hasher (car.build/kw->hasher ipld/hasher-sha2-256)
           encoder (car.block/encoder codec hasher)
           decoder (car.block/decoder codec hasher)
           data {:foo "bar"}
           in-block (<p! (encoder data))
           out-block (<p! (decoder in-block))]
       (is (fn? encoder)
           "encoder is a function")
       (is (fn? decoder)
           "decoder is a function")
       (is (instance? Block in-block)
           "the input is a block")
       (is (instance? Block out-block)
           "the output is a block")
       (done)))))

(deftest validator-test
  (t/async done
   (go
     (let [codec (car.build/kw->codec ipld/codec-json)
           hasher (car.build/kw->hasher ipld/hasher-sha2-256)
           encoder (car.block/encoder codec hasher)
           validator (car.block/validator codec hasher)
           data {:foo "bar"}
           in-block (<p! (encoder data))
           in-cid (car.block/block->cid in-block)
           out-block (<p! (validator in-block in-cid))]
       (is (fn? encoder)
           "encoder is a function")
       (is (fn? validator)
           "validator is a function")
       (is (instance? Block in-block)
           "the input is a Block")
       (is (instance? CID in-cid)
           "the input is a CID")
       (is (instance? Block out-block)
           "the decoded block is valid")
       (done)))))
