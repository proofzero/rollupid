(ns lib.multipart-test
  "Test multipart form data building."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.multipart :as lib.multipart]
   [com.kubelt.spec.multipart :as spec.multipart]))

;; Utilities
;; -----------------------------------------------------------------------------

#_(defn str->bytes
  "Convert a string into a byte array. In Clojure this is a [B, while in
  ClojureScript it returns a Uint8Array."
  [s]
  #?(:clj (bytes (byte-array (map (comp byte int) s)))
     :cljs (let [text-encoder (js/TextEncoder.)]
             (.encode text-encoder s))))

#_(defn same-bytes?
  [a b]
  #?(:clj (let [a (map int a)
                b (map int b)]
            (if (and a b (= (count a) (count b)))
              (zero? (reduce bit-or 0 (map bit-xor a b)))
              false))
     :cljs (goog.iter/equals a b)))

;; Tests
;; -----------------------------------------------------------------------------

(deftest create-test
  (testing "empty"
    (let [output (lib.multipart/create)]
      (is (lib.multipart/multipart? output)
          "predicate is correct")
      (is (malli/validate spec.multipart/multipart output)
          "multipart conforms to schema")
      (is (= 0 (get output :multipart/length))
          "multipart has content length of zero")
      (is (empty? (get output :multipart/parts))
          "multipart created with no parts")))

  (testing "with max bytes"
    (let [max-bytes 100
          options {:multipart/max-length max-bytes}
          output (lib.multipart/create options)]
      (is (lib.multipart/multipart? output)
          "predicate is correct")
      (is (malli/validate spec.multipart/multipart output)
          "multipart conforms to schema")
      (is (= 0 (get output :multipart/length))
          "multipart has content length of zero")
      (is (= max-bytes (get output :multipart/max-length))
          "multipart has expected maximum content length")
      (is (empty? (get output :multipart/parts))
          "multipart created with no parts"))))

(deftest append-part-test
  (testing "add string"
    (let [part-name "name"
          part-data "Foobar"
          multipart (lib.multipart/create)
          part {:part/name part-name
                :part/data part-data}
          multipart (lib.multipart/append-part multipart part)]
      (is (malli/validate spec.multipart/multipart multipart)
          "multipart conforms to schema")
      (is (= part-name (get-in multipart [:multipart/parts 0 :part/name]))
          "part name is set correctly")
      (is (= part-data (get-in multipart [:multipart/parts 0 :part/data]))
          "part data is set correctly")))

  (testing "add with filename"
    (let [part-name "name"
          part-filename "foobar.png"
          part-data "xxx"
          multipart (lib.multipart/create)
          part {:part/name part-name
                :part/file-name part-filename
                :part/data part-data}
          multipart (lib.multipart/append-part multipart part)]
      (is (malli/validate spec.multipart/multipart multipart)
          "multipart conforms to schema")
      (is (= part-name (get-in multipart [:multipart/parts 0 :part/name]))
          "part name is set correctly")
      (is (= part-filename (get-in multipart [:multipart/parts 0 :part/file-name]))
          "part filename is set correctly")
      (is (= part-data (get-in multipart [:multipart/parts 0 :part/data]))
          "part data is set correctly"))))
