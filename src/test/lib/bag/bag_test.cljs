(ns lib.bag.bag-test
  "Test the BAG data abstraction."
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

(deftest make-bag-test
  (testing "with defaults"
    (let [b (bag/make-bag)]
      (is (map? b))
      (is (= ipld/default-codec (:ipld/codec b))
          "the default IPLD codec is used")
      (is (= ipld/default-hasher (:ipld/hasher b))
          "the default IPLD hash is used")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema")))

  (testing "with given codec"
    (let [b (bag/make-bag {:ipld/codec ipld/codec-json})]
      (is (map? b))
      (is (= ipld/codec-json (:ipld/codec b))
          "the IPLD codec value is set as expected")
      (is (= ipld/default-hasher (:ipld/hasher b))
          "the default IPLD hash is used if not overridden")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema")))

  (testing "with given hash"
    (let [b (bag/make-bag {:ipld/hasher ipld/hasher-sha2-256})]
      (is (map? b))
      (is (= ipld/default-codec (:ipld/codec b))
          "the default IPLD codec is used if not overridden")
      (is (= ipld/hasher-sha2-256 (:ipld/hasher b))
          "the IPLD hash value is set as expected")
      (is (m/validate spec.bag/bag b)
          "the bag conforms to its schema"))))

(deftest add-dag-test
  (testing "with defaults"
    (let [b (bag/make-bag)
          d (bag.dag/make-dag)
          b' (bag/add-dag b d)]
      (is (m/validate spec.bag/bag b)
          "The initial bag conforms to its schema")
      (is (m/validate spec.bag/bag b')
          "The bag with added child dag conforms to schema")
      (is (m/validate spec.bag/dag d)
          "The dag conforms to its schema")
      (is (= (:ipld/codec b) (:ipld/codec b') (:ipld/codec d))
          "The IPLD codec is successfully passed along")
      (is (= (:ipld/hasher b) (:ipld/hasher b') (:ipld/hasher d))
          "The IPLD hash is successfully passed along")
      (is (= 0 (count (:kubelt.bag/dag b)))
          "bag starts off empty")
      (is (= 1 (count (:kubelt.bag/dag b')))
          "bag has single dag"))))
