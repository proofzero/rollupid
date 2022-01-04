(ns bag.bag-test
  "Test the BAG data abstraction."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.sdk.impl.bag :as bag]
   [com.kubelt.sdk.impl.bag.dag :as bag.dag]
   [com.kubelt.sdk.impl.bag.node :as bag.node]
   [com.kubelt.sdk.impl.ipld :as ipld]
   [com.kubelt.sdk.spec.bag :as spec.bag]))

(deftest make-bag-test
  (testing "with defaults"
    (let [b (bag/make-bag)]
      (is (map? b))
      (is (= ipld/default-codec (:ipld/codec b))
          "the default IPLD codec is used if not overridden")
      (is (= ipld/default-hash (:ipld/hash b))
          "the default IPLD hash is used if not overridden")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema")))

  (testing "with given codec"
    (let [b (bag/make-bag {:ipld/codec ipld/codec-json})]
      (is (map? b))
      (is (= ipld/codec-json (:ipld/codec b))
          "the IPLD codec value is set as expected")
      (is (= ipld/default-hash (:ipld/hash b))
          "the default IPLD hash is used if not overridden")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema")))

  (testing "with given hash"
    (let [b (bag/make-bag {:ipld/hash ipld/hash-sha2-256})]
      (is (map? b))
      (is (= ipld/default-codec (:ipld/codec b))
          "the default IPLD codec is used if not overridden")
      (is (= ipld/hash-sha2-256 (:ipld/hash b))
          "the IPLD hash value is set as expected")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema"))))

(deftest make-dag-test
  (testing "inherited defaults"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)]
      (is (map? d))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec d))
          "the dag uses same codec as parent bag")
      (is (= (:ipld/hash b) (:ipld/hash d))
          "the dag uses same hash as parent bag")))

  (testing "inherits codec"
    (let [b (bag/make-bag {:ipld/codec ipld/codec-json})
          d (bag.dag/make-dag b)]
      (is (map? b))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec d))
          "the dag uses the same non-default codec as parent bag")
      (is (= (:ipld/hash b) (:ipld/hash d))
          "the dag uses the same hash as parent bag")))

  (testing "sets codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b {:ipld/codec ipld/codec-json})]
      (is (= ipld/default-codec (:ipld/codec b))
          "the bag has the default codec")
      (is (= ipld/codec-json (:ipld/codec d))
          "the dag uses the codec specified in the options")))

  (testing "inherits hash"
    (let [b (bag/make-bag {:ipld/hash ipld/hash-blake3-256})
          d (bag.dag/make-dag b)]
      (is (map? d))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec d))
          "the dag uses the same codec as parent bag")
      (is (= (:ipld/hash b) (:ipld/hash d))
          "the dag uses the same non-default hash as parent bag")))

  (testing "sets hash"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b {:ipld/hash ipld/hash-blake3-256})]
      (is (= ipld/default-hash (:ipld/hash b))
          "the bag has the default hash")
      (is (= ipld/hash-blake3-256 (:ipld/hash d))
          "the dag uses the hash specified in the options"))))

(deftest dag-builder-test
  (testing "without options"
    (let [b (bag/make-bag)
          f (bag.dag/builder b)
          d (f)]
      (is (map? d))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec d))
          "the dag uses the same codec as parent bag")
      (is (= (:ipld/hash b) (:ipld/hash d))
          "the dag uses the same hash as parent bag")))

  (testing "with codec"
    (let [b (bag/make-bag)
          f (bag.dag/builder b {:ipld/codec ipld/codec-raw})
          d (f)]
      (is (map? d))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec d))
          "the dag uses the specified codec")
      (is (= (:ipld/hash b) (:ipld/hash d))
          "the dag uses the same hash as parent bag")))

  (testing "with hash"
    (let [b (bag/make-bag)
          f (bag.dag/builder b {:ipld/hash ipld/hash-blake3-256})
          d (f)]
      (is (map? d))
      (is (m/validate spec.bag/dag d)
          "the dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec d))
          "the dag uses the same codec as parent bag")
      (is (= ipld/hash-blake3-256 (:ipld/hash d))
          "the dag uses the specified hash"))))

(deftest make-node-test
  (testing "with defaults"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/make-node d data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (bag.node/data n))
          "node data is correctly stored")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/make-node d data {:ipld/codec ipld/codec-raw})]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (bag.node/data n))
          "node data is correctly stored")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with hash"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/make-node d data {:ipld/hash ipld/hash-blake3-256})]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/hash-blake3-256 (:ipld/hash n))
          "node has the expected hash")
      (is (= data (bag.node/data n))
          "node data is correctly stored")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node"))))

(deftest cbor-node-test
  (testing "without options"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/cbor-node d data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-cbor (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with different codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/cbor-node d data {:ipld/codec ipld/codec-raw})]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-cbor (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node"))))

(deftest json-node-test
  (testing "without options"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/json-node d data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with different codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/json-node d data {:ipld/codec ipld/codec-raw})]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (bag.node/leaf? n)
          "node is a leaf node"))))

(deftest raw-node-test
  (testing "without options"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/raw-node d data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/raw-node d data {:ipld/codec ipld/codec-json})]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node"))))

(deftest node-builder-test
  (testing "without options"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          f (bag.node/builder d)
          data {:foo "bar"}
          n (f data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with codec"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          f (bag.node/builder d {:ipld/codec ipld/codec-raw})
          data {:foo "bar"}
          n (f data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/codec-raw (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/default-hash (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node")))

  (testing "with hash"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          f (bag.node/builder d {:ipld/hash ipld/hash-blake3-256})
          data {:foo "bar"}
          n (f data)]
      (is (map? n))
      (is (m/validate spec.bag/node n)
          "node conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec n))
          "node has the expected codec")
      (is (= ipld/hash-blake3-256 (:ipld/hash n))
          "node has the expected hash")
      (is (= data (:kubelt.node/data n))
          "node has the expected data")
      (is (= [] (bag.node/children n))
          "node has no children")
      (is (bag.node/leaf? n)
          "node is a leaf node"))))

(deftest add-dag-test
  (testing "with defaults"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          b' (bag/add-dag b d)]
      (is (map? d))
      (is (map? b))
      (is (map? b'))
      (is (= b (:kubelt.dag/bag d))
          "The parent bag is correctly stored")
      (is (m/validate spec.bag/bag b)
          "The initial bag conforms to its schema")
      (is (m/validate spec.bag/bag b')
          "The bag with added child dag conforms to schema")
      (is (m/validate spec.bag/dag d)
          "The dag conforms to its schema")
      (is (= b (:kubelt.dag/bag d))
          "The dag stores a parent bag reference")
      (is (= (:ipld/codec b) (:ipld/codec b') (:ipld/codec d))
          "The IPLD codec is successfully passed along")
      (is (= (:ipld/hash b) (:ipld/hash b') (:ipld/hash d))
          "The IPLD hash is successfully passed along"))))

(deftest set-root-test
  (testing "set root node of dag"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/make-node d data)
          d' (bag.dag/set-root d n)]
      (is (map? d'))
      (is (m/validate spec.bag/dag d')
          "the dag conforms to its schema")
      (is (= n (:kubelt.dag/root d'))
          "the dag has the expected root node"))))
