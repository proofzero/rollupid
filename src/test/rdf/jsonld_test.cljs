(ns rdf.jsonld-test
  "Test the parsing of JSON-LD into RDF/cljs data values."
  (:require
   [cljs.test :as t :refer [deftest is testing use-fixtures]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.rdf.json-ld :as rdf.json-ld]
   [com.kubelt.spec.rdf :as spec.rdf]))

;; Utilities
;; -----------------------------------------------------------------------------

(defn blank-node
  "Construct a blank node map, as would be returned by parsing JSON-LD
  data using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termType "BlankNode"
   :value value})

(defn default-graph
  "Construct a default graph map, as would be returned by parsing JSON-LD
  data using the jsonld library."
  []
  {:termType "DefaultGraph" :value ""})

(defn literal
  "Construct a literal map, as would be returned by parsing JSON-LD data
  using the jsonld library. Providing the language is optional."
  ([value datatype]
   {:pre [(string? value) (map? datatype)]}
   {:termType "Literal"
    :value value
    :datatype datatype})
  ([value language datatype]
   {:pre [(string? value) (string? language) (map? datatype)]}
   {:termType "Literal"
    :value value
    :language language
    :datatype datatype}))

(defn named-node
  "Construct a named node map, as would be returned by parsing JSON-LD
  data using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termType "NamedNode"
   :value value})

(defn variable
  "Construct a variable map, as would be returned by parsing JSON-LD data
  using the jsonld library."
  [value]
  {:pre [(string? value)]}
  {:termType "Variable" :value value})

(defn quad
  "Construct a quad map, as would be returned by parsing JSON-LD data
  using the jsonld library."
  [m]
  {:pre [(map? m)]}
  (merge {:termType "Quad"} m))

;; Fixtures
;; -----------------------------------------------------------------------------
;; A fixture can run :once (before and after *all* tests are executed),
;; or :each (before and after each individual test).

#_(use-fixtures :once
  {:before (fn [] (println "start all"))
   :after (fn [] (println "done all"))})

#_(use-fixtures :each
  {:before (fn [] (println "start test"))
   :after (fn [] (println "done test"))})

;; Data
;; -----------------------------------------------------------------------------

(def datatype-string
  {:termType "NamedNode",
   :value "http://www.w3.org/2001/XMLSchema#string"})

(def blank-b0
  (blank-node "_:b0"))

(def blank-b1
  (blank-node "_:b1"))

(def blank-b2
  (blank-node "_:b2"))

(def named-image
  (named-node "http://schema.org/image"))

(def named-name
  (named-node "http://schema.org/name"))

(def named-url
  (named-node "http://schema.org/url"))

(def literal-name
  (literal "Kubelt" "en" datatype-string))

(def graph
  (default-graph))

(def quad-one
  (quad {:subject blank-b0
         :predicate named-image
         :object blank-b1
         :graph graph}))

(def quad-two
  (quad {:subject blank-b0
         :predicate named-name
         :object literal-name
         :graph graph}))

(def quad-three
  (quad {:subject blank-b0
         :predicate named-url
         :object blank-b2
         :graph graph}))

(def doc
  "An example of the data returned by the jsonld library when parsing
  JSON-LD data. Note that this is all JavaScript data."
  #js [(clj->js quad-one)
       (clj->js quad-two)
       (clj->js quad-three)])

;; Tests
;; -----------------------------------------------------------------------------

;; Ensure that an RDF/js named node is correctly converted to RDF/cljs.
(deftest named-node-test
  (let [value "https://schema.org/url"
        node (named-node value)
        term (rdf.json-ld/named-node->value node)]
    (is (map? term))
    (is (malli/validate spec.rdf/named-node term))
    (is (= (:rdf/type term) :rdf.term/named-node))
    (is (= (:value term) value))))

;; Ensure that an RDF/js literal is correctly converted to RDF/cljs.
(deftest literal-test
  (let [value "Kubelt"
        language "en"
        node (literal value language datatype-string)
        term (rdf.json-ld/literal->value node)]
    (is (map? term))
    (is (malli/validate spec.rdf/literal term))
    (is (= (:rdf/type term) :rdf.term/literal))
    (is (= (:language term) language))
    (is (= (:value term) value))
    ;; Check that the datatype map is converted to a RDF/cljs named node
    ;; map with the expected type URI (in this case, of an XML String).
    (let [string-uri (:value datatype-string)
          term-datatype (:datatype term)]
      (is (map? term-datatype))
      (is (malli/validate spec.rdf/named-node term-datatype))
      (is (= (:rdf/type term-datatype) :rdf.term/named-node))
      (is (= (:value term-datatype) string-uri)))))

;; Ensure that an RDF/js default graph is correctly converted to
;; RDF/cljs.
(deftest default-graph-test
  (let [node (default-graph)
        term (rdf.json-ld/default-graph->value node)]
    (is (map? term))
    (is (malli/validate spec.rdf/default-graph term))
    (is (= (:rdf/type term) :rdf.term/default-graph))
    (is (= (:value term) ""))))

;; Ensure that an RDF/js blank node is correctly converted to RDF/cljs.
(deftest blank-node-test
  (testing "with a non-prefixed blank node name"
    ;; Test using a non-prefixed blank node name.
    (let [value "b0"
          node (blank-node value)
          term (rdf.json-ld/blank-node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/blank-node term))
      (is (= (:rdf/type term) :rdf.term/blank-node))
      (is (= (:value term) value))))

  (testing "with a prefixed blank node name"
    ;; Test using a prefixed node name (having a prefix of "_:"). The
    ;; stored name value should be stripped of its prefix.
    (let [name "b0"
          prefixed (str/join ":" ["_" name])
          node (blank-node prefixed)
          term (rdf.json-ld/blank-node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/blank-node term))
      (is (= (:rdf/type term) :rdf.term/blank-node))
      (is (= (:value term) name)))))

;; Ensure that an RDF/js variable is correctly converted to RDF/cljs.
(deftest variable-test
  (let [value "foobar"
        node (variable value)
        term (rdf.json-ld/variable->value node)]
    (is (map? term))
    (is (malli/validate spec.rdf/variable term))
    (is (= (:rdf/type term) :rdf.term/variable))
    (is (= (:value term) value))))

(deftest quad-test
  (let [quad {:subject blank-b0
              :predicate named-image
              :object blank-b1
              :graph graph}
        term (rdf.json-ld/quad->value quad)]
    (is (map? term))
    (is (malli/validate spec.rdf/quad term))))

(deftest node-test
  (testing "with blank node"
    (let [value "b0"
          node (blank-node value)
          term (rdf.json-ld/node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/blank-node term))
      (is (= (:rdf/type term) :rdf.term/blank-node))
      (is (= (:value term) value))))

  (testing "with default graph"
    (let [node (default-graph)
          term (rdf.json-ld/node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/default-graph term))
      (is (= (:rdf/type term) :rdf.term/default-graph))
      (is (= (:value term) ""))))

  (testing "with literal"
    (let [value "kubelt"
          node (literal value datatype-string)
          term (rdf.json-ld/node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/literal term))
      (is (= (:rdf/type term) :rdf.term/literal))
      (is (= (:value term) value))))

  (testing "with named node"
    (let [value "http://schema.org/image"
          node (named-node value)
          term (rdf.json-ld/node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/named-node term))
      (is (= (:rdf/type term) :rdf.term/named-node))
      (is (= (:value term) value))))

  (testing "with variable"
    (let [value "?foobar"
          node (variable value)
          term (rdf.json-ld/node->value node)]
      (is (map? term))
      (is (malli/validate spec.rdf/variable term))
      (is (= (:rdf/type term) :rdf.term/variable))
      (is (= (:value term) value))))

  (testing "with quad"
    (let [quad quad-one
          term (rdf.json-ld/node->value quad)]
      (is (map? term))
      (is (malli/validate spec.rdf/quad term))

      (is (= :rdf.term/quad (:rdf/type term)))

      (testing "with subject"
        (is (= :rdf.term/blank-node (get-in term [:rdf.quad/subject :rdf/type])))
        (is (= "b0" (get-in term [:rdf.quad/subject :value]))))

      (testing "with predicate"
        (is (= :rdf.term/named-node (get-in term [:rdf.quad/predicate :rdf/type])))
        (is (= "http://schema.org/image" (get-in term [:rdf.quad/predicate :value]))))

      (testing "with object"
        (is (= :rdf.term/blank-node (get-in term [:rdf.quad/object :rdf/type])))
        (is (= "b1" (get-in term [:rdf.quad/object :value]))))

      (testing "with graph term"
        (is (= :rdf.term/default-graph (get-in term [:rdf.quad/graph :rdf/type])))
        (is (= "" (get-in term [:rdf.quad/graph :value])))))))

(deftest js-test
  (let [quads-p (rdf.json-ld/js->graph doc)]
    (-> quads-p
        (.then (fn [graph]
                 (is (map? graph))
                 (is (= :rdf.type/graph (:rdf/type graph)))
                 ;; Validate result is a RDF/cljs knowledge graph.
                 (is (malli/validate spec.rdf/knowledge-graph graph))
                 (let [quads (:quads graph)]
                   (is (vector? quads))
                   ;; Three quads * 4 components.
                   (is (= 12 (count quads)))))))))
