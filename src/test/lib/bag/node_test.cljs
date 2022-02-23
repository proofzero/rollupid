(ns lib.bag.node-test
  "Test the BAG node implementation."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.lib.bag :as bag]
   [com.kubelt.lib.bag.dag :as bag.dag]
   [com.kubelt.lib.bag.node :as bag.node]
   [com.kubelt.lib.ipld :as ipld]
   [com.kubelt.spec.bag :as spec.bag]))

(deftest make-node-test
  (testing "with defaults"
    (let [data {:foo "bar"}
          node (bag.node/make-node data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (not (contains? node :ipld/codec))
          "node has no codec specified")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (bag.node/data node))
          "node data is correctly stored")))

  (testing "with codec"
    (let [data {:foo "bar"}
          options {:ipld/codec ipld/codec-raw}
          node (bag.node/make-node data options)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (bag.node/data node))
          "node data is correctly stored")))

  (testing "with hash"
    (let [data {:foo "bar"}
          options {:ipld/hasher ipld/hasher-blake3-256}
          node (bag.node/make-node data options)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (not (contains? node :ipld/codec))
          "node has no codec specified")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher node))
          "node has the expected hash")
      (is (= data (bag.node/data node))
          "node data is correctly stored"))))

(deftest cbor-node-test
  (testing "without options"
    (let [data {:foo "bar"}
          node (bag.node/cbor-node data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-cbor (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with hash"
    (let [data {:foo "bar"}
          node (bag.node/cbor-node data {:ipld/hasher ipld/hasher-blake3-256})]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-cbor (:ipld/codec node))
          "node has the expected codec")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher node))
          "node has the specified hasher")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with different codec"
    (let [data {:foo "bar"}
          options {:ipld/codec ipld/codec-raw}
          node (bag.node/cbor-node data options)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-cbor (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data"))))

(deftest json-node-test
  (testing "without options"
    (let [data {:foo "bar"}
          node (bag.node/json-node data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with hash"
    (let [data {:foo "bar"}
          node (bag.node/json-node data {:ipld/hasher ipld/hasher-blake3-256})]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec node))
          "node has the expected codec")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher node))
          "node has the specified hasher")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with different codec"
    (let [data {:foo "bar"}
          options {:ipld/codec ipld/codec-raw}
          node (bag.node/json-node data options)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data"))))

(deftest raw-node-test
  (testing "without options"
    (let [data {:foo "bar"}
          node (bag.node/raw-node data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with hash"
    (let [data {:foo "bar"}
          node (bag.node/raw-node data {:ipld/hasher ipld/hasher-blake3-256})]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec node))
          "node has the expected codec")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher node))
          "node has the specified hasher")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with different codec"
    (let [data {:foo "bar"}
          options {:ipld/codec ipld/codec-json}
          node (bag.node/raw-node data options)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data"))))

(deftest node-builder-test
  (testing "with codec"
    (let [builder (bag.node/builder {:ipld/codec ipld/codec-raw})
          data {:foo "bar"}
          node (builder data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec node))
          "node has the expected codec")
      (is (not (contains? node :ipld/hasher))
          "node has no hasher specified")
      (is (= data (:kubelt.node/data node))
          "node has the expected data")))

  (testing "with hash"
    (let [builder (bag.node/builder {:ipld/hasher ipld/hasher-blake3-256})
          data {:foo "bar"}
          node (builder data)]
      (is (map? node))
      (is (m/validate spec.bag/node node)
          "node conforms to its schema")
      (is (not (contains? node :ipld/codec))
          "node has no codec specified")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher node))
          "node has the expected hash")
      (is (= data (:kubelt.node/data node))
          "node has the expected data"))))
