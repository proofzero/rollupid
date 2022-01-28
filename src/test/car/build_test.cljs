(ns car.build-test
  "Test the creation of a car-map from a BAG."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
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
   [com.kubelt.lib.bag :as bag]
   [com.kubelt.lib.bag.dag :as bag.dag]
   [com.kubelt.lib.bag.node :as bag.node]
   [com.kubelt.lib.car.build :as car.build]
   [com.kubelt.lib.ipld :as ipld]
   [com.kubelt.spec.car :as spec.car]))

;; Definitions
;; -----------------------------------------------------------------------------
;; Each of the IPLD codecs and hashes used to encode blocks has a unique
;; code and name.

;;
;; Codecs
;;

(def raw-code 85)
(def raw-name "raw")

(def cbor-code 113)
(def cbor-name "dag-cbor")

(def json-code 297)
(def json-name "dag-json")

;;
;; Hashes
;;

;; We hash this string with each hasher and compare with the expected
;; result to validate that the hash function is what is says on the tin.
(def example-input
  "The quick brown fox jumps over the lazy dog")

(def sha2-256-code 18)
(def sha2-256-name "sha2-256")
(def sha2-256-sum "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592")

;; Tests
;; -----------------------------------------------------------------------------

;; Test the function that maps from the keywords used in BAGs to
;; represent the codec that should be used for en/decoding, into the
;; implementation object that will be used to do the work.
;;
;; TODO test codec encode / decode
(deftest kw->codec-test
  (letfn [(test-codec [codec code name]
            (is (object? codec)
                "codec is a JavaScript object")
            (is (= code (.-code codec))
                "codec has correct code")
            (is (= name (.-name codec))
                "codec has correct name")
            (is (fn? (.-encode codec))
                "codec has an 'encode' method")
            (is (fn? (.-decode codec))
                "codec has a 'decode' method"))]
    (testing "raw codec"
      (let [kw ipld/codec-raw
            codec (car.build/kw->codec kw)]
        (test-codec codec raw-code raw-name)))

    (testing "cbor codec"
      (let [kw ipld/codec-cbor
            codec (car.build/kw->codec kw)]
        (test-codec codec cbor-code cbor-name)))

    (testing "json codec"
      (let [kw ipld/codec-json
            codec (car.build/kw->codec kw)]
        (test-codec codec json-code json-name)))))

;; Test the function that maps from the keywords used in BAGs to
;; represent the hash algorithm that should be used for hashing, into
;; the implementation object that will be used to do the work.
(deftest kw->hasher-test
  (letfn [;; Use the given hasher to hash the input and return a hex
          ;; string. Use to check that a test vector has expected hash
          ;; output.
          (hash-encode [hasher input]
            (-> hasher
                (.encode input)
                js/Buffer.from
                (.toString "hex")))

          (test-hasher [hasher code name sum]
            (is (instance? js/Object hasher)
                "hasher is a JavaScript object")
            (is (= name (.-name hasher))
                "hasher has the correct name")
            (is (= code (.-code hasher))
                "hasher has the correct code")
            (is (fn? (.-encode hasher))
                "hasher has an 'encode' method")
            (is (fn? (.-digest hasher))
                "hasher has a 'digest' method")
            (is (= sum (hash-encode hasher example-input))
                "hasher encodes input correctly"))]
    (testing "hash sha2-256"
      (let [kw ipld/hasher-sha2-256
            hasher (car.build/kw->hasher kw)]
        (test-hasher hasher sha2-256-code sha2-256-name sha2-256-sum)))

    (testing "hash blake3"
      ;; TODO
      )))

(deftest node->block-test
  (testing ""
    (let [b (bag/make-bag)
          d (bag.dag/make-dag b)
          data {:foo "bar"}
          n (bag.node/make-node d data)]
      ;; TODO
      )))

(deftest dag->blocks-test
  (testing ""
    ;; TODO
    ))

(deftest car?-test
  (testing "valid car"
    ;; TODO
    )

  (testing "invalid car"
    ;; TODO
    ))

(deftest car-test
  #_(testing "invalid bag"
    (let [bag {}
          car (car.build/car bag)]
      ;; TODO
      ))

  (testing "empty bag"
    (t/async done
     (go
       (let [bag (bag/make-bag)
             car (<p! (car.build/car bag))]
         (is (car.build/car? car))
         ;; TODO
         (done))))))
