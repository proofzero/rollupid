(ns lib.bag.dag-test
  "Test the BAG dag implementation."
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

(deftest make-dag-test
  (testing "with defaults"
    (let [dag (bag.dag/make-dag)]
      (is (map? dag))
      (is (m/validate spec.bag/dag dag)
          "the dag conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec dag))
          "the dag uses the default codec")
      (is (= ipld/default-hasher (:ipld/hasher dag))
          "the dag uses the default hash")))

  (testing "sets codec"
    (let [dag (bag.dag/make-dag {:ipld/codec ipld/codec-json})]
      (is (map? dag))
      (is (m/validate spec.bag/dag dag)
          "the dag conforms to its schema")
      (is (= ipld/codec-json (:ipld/codec dag))
          "the dag uses the specified codec")
      (is (= ipld/default-hasher (:ipld/hasher dag))
          "the dag uses the same hash as parent bag")))

  (testing "sets hash"
    (let [dag (bag.dag/make-dag {:ipld/hasher ipld/hasher-blake3-256})]
      (is (map? dag))
      (is (m/validate spec.bag/dag dag)
          "the dag conforms to its schema")
      (is (= ipld/default-codec (:ipld/codec dag))
          "the dag uses the same codec as parent bag")
      (is (= ipld/hasher-blake3-256 (:ipld/hasher dag))
          "the dag uses the specified hash"))))

(deftest has-root?-test
  (testing "new dag has no root node"
    (let [dag (bag.dag/make-dag)]
      (is (not (bag.dag/has-root? dag))
          "a new dag has no root node")))

  (testing "a dag with a root node"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})
          dag' (bag.dag/add-child dag node)]
      (is (bag.dag/has-root? dag')
          "dag has a root node"))))

(deftest has-node?-test
  (testing "new dag has no nodes"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})]
      (is (not (bag.dag/has-node? dag node))
          "new dag has no node")))

  (testing "a root node belongs to a dag"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})
          dag' (bag.dag/add-child dag node)]
      (is (bag.dag/has-node? dag' node)
          "a dag has a root node"))))

(deftest root-test
  (testing "a new dag has no root node"
    (let [dag (bag.dag/make-dag)]
      (is (nil? (bag.dag/root dag))
          "new dag root is nil"))))

(deftest children-test
  (testing "node with no children"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})
          dag' (bag.dag/add-child dag node)]
      (is (empty? (bag.dag/children dag' node))
          "there are no children of a leaf node")))

  (testing "node with a single child"
    (let [dag (bag.dag/make-dag)
          parent (bag.node/make-node {:parent true})
          child (bag.node/make-node {:child true})
          dag' (-> dag
                   (bag.dag/add-child parent)
                   (bag.dag/add-child parent child))]
      (is (empty? (bag.dag/children dag' child))
          "a leaf node has no children")
      (is (= 1 (count (bag.dag/children dag' parent)))))))

(deftest leaf?-test
  (testing "a new node is not a leaf"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})]
      (is (bag.dag/leaf? dag node)
          "an un-added node is not a leaf node")))

  (testing "a root node is a leaf node"
    (let [dag (bag.dag/make-dag)
          node (bag.node/make-node {:foo "bar"})
          dag' (bag.dag/add-child dag node)]
      (is (bag.dag/leaf? dag' node)
          "a single root node is a leaf")))

  (testing "a root node with child is not a leaf"
    (let [dag (bag.dag/make-dag)
          parent (bag.node/make-node {:parent true})
          child (bag.node/make-node {:child true})
          dag' (-> dag
                   (bag.dag/add-child parent)
                   (bag.dag/add-child parent child))]
      (is (not (bag.dag/leaf? dag' parent))
          "a parent node is not a leaf node")
      (is (bag.dag/leaf? dag' child)
          "the child node is a leaf node"))))

(deftest branch?-test
  (testing ""
    ;; TODO
    ))

(deftest node-seq-test
  (testing "empty dag"
    (let [dag (bag.dag/make-dag)
          node-seq (bag.dag/node-seq dag)]
      (is (not (bag.dag/has-root? dag))
          "dag has no root node")
      (is (nil? node-seq)
          "seq of an empty collection is nil")
      (is (not (seq? node-seq))
          "returned value is not a seq")))

  (testing "single node dag"
    (let [dag (bag.dag/make-dag)
          data {:foo "bar"}
          node (bag.node/make-node data)
          dag' (bag.dag/add-child dag node)
          node-seq (bag.dag/node-seq dag')]
      (is (bag.dag/has-root? dag')
          "dag has a root node")
      (is (seq? node-seq)
          "returned value is a seq")
      (is (= 1 (count node-seq))
          "seq has a single entry")
      ;; Compare node data since the node returned as part of the node
      ;; sequence may have been altered via the addition of various
      ;; other attributes, meaning direct equality comparison will fail.
      (let [first-data (:kubelt.node/data (first node-seq))]
        (is (= data first-data)
            "first seq entry is the expected node"))))

  (testing "two node dag"
    (let [dag (bag.dag/make-dag)
          parent (bag.node/make-node {:parent true})
          child (bag.node/make-node {:child true})
          dag' (-> dag
                   (bag.dag/add-child parent)
                   (bag.dag/add-child parent child))
          node-seq (bag.dag/node-seq dag')]
      (is (= 2 (count node-seq))
          "there are two nodes in the sequence")
      (let [first-node (first node-seq)
            second-node (second node-seq)]
        (is (:parent (:kubelt.node/data first-node)))
        (is (:child (:kubelt.node/data second-node)))))))

#_(deftest set-root-test
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

(deftest as-tree-test
  (testing ""
    (let [dag (bag.dag/make-dag)]
      ;; TODO
      )))
