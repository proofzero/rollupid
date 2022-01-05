(ns ipld-test
  "Test the IPLD-related utilities."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [com.kubelt.sdk.impl.ipld :as ipld]))


(deftest codec-test
  (testing "valid codec"
    (is (ipld/codec? ipld/codec-cbor))
    (is (ipld/codec? ipld/codec-json))
    (is (ipld/codec? ipld/codec-raw))
    (is (ipld/codec? ipld/default-codec)
        "the default IPLD codec passes the check predicate"))

  (testing "invalid codec"
    (is (not (ipld/codec? "foobar")))
    (is (not (ipld/codec? :foobar)))
    (is (not (ipld/codec? {})))
    (is (not (ipld/codec? []))))

  (testing "supported codecs"
    (is (set? ipld/supported-codecs))
    (is (contains? ipld/supported-codecs ipld/default-codec)
        "the default IPLD codec is in the set of supported codecs")))

(deftest hash-test
  (testing "valid hash"
    (is (ipld/hash? ipld/hash-blake3-256))
    (is (ipld/hash? ipld/hash-sha2-256))
    (is (ipld/hash? ipld/default-hash)
        "the default IPLD hash passes the check predicate"))

  (testing "invalid hash"
    (is (not (ipld/hash? "foobar")))
    (is (not (ipld/hash? :foobar)))
    (is (not (ipld/hash? {})))
    (is (not (ipld/hash? []))))

  (testing "supported hashes"
    (is (set? ipld/supported-hashes))
    (is (contains? ipld/supported-hashes ipld/default-hash)
        "the default IPLD hash is in the set of supported hashes")))
