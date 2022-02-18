(ns key.key-test
  "Test the key-related protocol implementations."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.key.node :as key]
   [com.kubelt.proto.key :as proto.key]))

;; utilities
;; -----------------------------------------------------------------------------

#_(defn blank-node
  "construct a blank node map, as would be returned by parsing json-ld
  data using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termtype "blanknode"
   :value value})

#_(defn default-graph
  "construct a default graph map, as would be returned by parsing json-ld
  data using the jsonld library."
  []
  {:termtype "defaultgraph" :value ""})

#_(defn literal
  "construct a literal map, as would be returned by parsing json-ld data
  using the jsonld library. providing the language is optional."
  ([value datatype]
   {:pre [(string? value) (map? datatype)]}
   {:termtype "literal"
    :value value
    :datatype datatype})
  ([value language datatype]
   {:pre [(string? value) (string? language) (map? datatype)]}
   {:termtype "literal"
    :value value
    :language language
    :datatype datatype}))

#_(defn named-node
  "construct a named node map, as would be returned by parsing json-ld
  data using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termtype "namednode"
   :value value})

#_(defn variable
  "construct a variable map, as would be returned by parsing json-ld data
  using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termtype "variable" :value value})

#_(defn quad
  "construct a quad map, as would be returned by parsing json-ld data
  using the jsonld library."
  [m]
  {:pre [(map? m)]}
  (merge {:termtype "quad"} m))

;; fixtures
;; -----------------------------------------------------------------------------
;; a fixture can run :once (before and after *all* tests are executed),
;; or :each (before and after each individual test).

#_(use-fixtures :once
  {:before (fn [] (println "start all"))
   :after (fn [] (println "done all"))})

#_(use-fixtures :each
  {:before (fn [] (println "start test"))
   :after (fn [] (println "done test"))})

;; data
;; -----------------------------------------------------------------------------

(def secret-string
  "s3kre7")

(def secret-buffer
  (js/Buffer.from secret-string))

#_(def datatype-string
  {:termtype "namednode",
   :value "http://www.w3.org/2001/xmlschema#string"})

#_(def blank-b0
  (blank-node "_:b0"))

#_(def blank-b1
  (blank-node "_:b1"))

#_(def blank-b2
  (blank-node "_:b2"))

#_(def named-image
  (named-node "http://schema.org/image"))

#_(def named-name
  (named-node "http://schema.org/name"))

#_(def named-url
  (named-node "http://schema.org/url"))

#_(def literal-name
  (literal "Kubelt" "en" datatype-string))

#_(def graph
  (default-graph))

#_(def quad-one
  (quad {:subject blank-b0
         :predicate named-image
         :object blank-b1
         :graph graph}))

#_(def quad-two
  (quad {:subject blank-b0
         :predicate named-name
         :object literal-name
         :graph graph}))

#_(def quad-three
  (quad {:subject blank-b0
         :predicate named-url
         :object blank-b2
         :graph graph}))

#_(def doc
  "An example of the data returned by the jsonld library when parsing
  JSON-LD data. Note that this is all JavaScript data."
  #js [(clj->js quad-one)
       (clj->js quad-two)
       (clj->js quad-three)])

;; Tests
;; -----------------------------------------------------------------------------
;; TODO test export of secret key as buffer
;; TODO test export of secret key as jwk

#_(deftest secret-key-test
  (testing "make secret key from string"
    (let [secret-key (key/make-secret-key secret-string)
          key-length (count secret-string)]
      (is (record? secret-key)
          "secret key is a record")
      (is (satisfies? proto.key/SymmetricKey secret-key)
          "secret key implements SymmetricKey protocol")
      (is (= key-length (proto.key/key-size secret-key))
          "secret key has expected length in bytes")))

  (testing "make secret key from Buffer"
    (let [secret-key (key/make-secret-key secret-buffer)
          key-length (count secret-string)]
      (is (record? secret-key)
          "secret key is a record")
      (is (satisfies? proto.key/SymmetricKey secret-key)
          "secret key implements SymmetricKey protocol")
      (is (= key-length (proto.key/key-size secret-key))
          "secret key has expected length in bytes")))

  (testing "make secret key from ArrayBuffer")
  (testing "make secret key from TypedArray")
  (testing "make secret key from DataView"))

#_(deftest private-key-test
  (testing "make private key from string"
    (let [private-key (key/make-private-key secret-string)]
      (is (record? private-key)
          "private key is a record")
      (is (satisfies? proto.key/AsymmetricKey private-key)
          "private key implements AsymmetricKey protocol")
      )))

#_(deftest js-test
  (let [quads-p (rdf.json-ld/js->graph doc)]
    (-> quads-p
        (.then (fn [graph]
                 (is (map? graph))
                 (is (= :rdf.type/graph (:rdf/type graph)))
                 ;; Validate result is a RDF/cljs knowledge graph.
                 (is (malli/validate spec.quad/knowledge-graph graph))
                 (let [quads (:quads graph)]
                   (is (vector? quads))
                   ;; Three quads * 4 components.
                   (is (= 12 (count quads)))))))))
