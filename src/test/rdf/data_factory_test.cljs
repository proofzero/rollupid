(ns rdf.data-factory-test
  "Test the conversion of RDF/js data factory instances into RDF/cljs data
  values."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["rdf-data-factory" :refer
    [DataFactory
     RDF.Term
     BlankNode
     DefaultGraph
     Literal
     NamedNode
     Variable
     Quad]])
  (:require
   [clojure.string :as str]
   [cljs.test :as t :refer [deftest is testing use-fixtures]])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.sdk.spec.quad :as spec.quad]
   [com.kubelt.sdk.impl.rdf.data-factory :as rdf.df]))

;; Data
;; -----------------------------------------------------------------------------

(def xml-string-uri
  "http://www.w3.org/2001/XMLSchema#string")

(def rdf-lang-uri
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")

;; Utilities
;; -----------------------------------------------------------------------------
;; These convenience functions construct RDF/js instances of the various
;; Term types.

(defn blank-node
  "Construct a BlankNode RDF/js Term."
  [value]
  {:pre [(string? value)]}
  (let [df (DataFactory.)]
    (.blankNode df value)))

(defn named-node
  "Construct a NamedNode RDF/js Term."
  [value]
  {:pre [(string? value)]}
  (let [df (DataFactory.)]
    (.namedNode df value)))

(defn literal
  "Construct a Literal RDF/js Term."
  ([value]
   {:pre [(string? value)]}
   (let [df (DataFactory.)]
     (.literal df value)))
  ([value language-datatype]
   {:pre [(string? value)
          (or (string? language-datatype)
              (rdf.df/named-node? language-datatype))]}
   (let [df (DataFactory.)]
     ;; If the literal has a language, its datatype has the
     ;; IRI "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString". Otherwise,
     ;; if no datatype is explicitly specified, the datatype has the
     ;; IRI "http://www.w3.org/2001/XMLSchema#string".
     (.literal df value language-datatype))))

(defn variable
  "Construct a Variable RDF/js Term."
  [value]
  {:pre [(string? value)]}
  (let [df (DataFactory.)]
    (.variable df value)))

(defn default-graph
  "Construct a DefaultGraph RDF/js Term."
  []
  (let [df (DataFactory.)]
    (.defaultGraph df)))

(defn quad
  "Construct a Quad RDF/js Term."
  [subject predicate object graph]
  {:pre [(rdf.df/subject-term? subject)
         (rdf.df/predicate-term? predicate)
         (rdf.df/object-term? object)
         (rdf.df/graph-term? graph)]}
  [subject predicate object graph]
  (let [df (DataFactory.)]
    (.quad df subject predicate object graph)))

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

;; Predicate Tests
;; -----------------------------------------------------------------------------

;; Check that the predicate blank-node? correctly detects BlankNode
;; instances.
(deftest blank-node?-test
  (let [node (BlankNode.)]
    (testing "with blank node"
      (is (rdf.df/blank-node? node)))
    (testing "with non-blank node"
      (is (not (rdf.df/blank-node? {})))
      (is (not (rdf.df/blank-node? [])))
      (is (not (rdf.df/blank-node? #{}))))))

;; Check that the predicate named-node? correctly detects NamedNode
;; instances.
(deftest named-node?-test
  (let [node (NamedNode.)]
    (testing "with named node"
      (is (rdf.df/named-node? node)))
    (testing "with non-named node"
      (is (not (rdf.df/named-node? {})))
      (is (not (rdf.df/named-node? [])))
      (is (not (rdf.df/named-node? #{}))))))

;; Check that the predicate literal? correctly detects Literal
;; instances.
(deftest literal?-test
  (let [node (Literal.)]
    (testing "with literal"
      (is (rdf.df/literal? node)))
    (testing "with non-literal"
      (is (not (rdf.df/literal? {})))
      (is (not (rdf.df/literal? [])))
      (is (not (rdf.df/literal? #{}))))))

;; Check that the predicate variable? correctly detects Variable
;; instances.
(deftest variable?-test
  (let [node (Variable.)]
    (testing "with variable"
      (is (rdf.df/variable? node)))
    (testing "with non-variable"
      (is (not (rdf.df/variable? {})))
      (is (not (rdf.df/variable? [])))
      (is (not (rdf.df/variable? #{}))))))

;; Check that the predicate default-graph? correctly detects
;; DefaultGraph instances.
(deftest default-graph?-test
  (let [node (DefaultGraph.)]
    (testing "with default graph"
      (is (rdf.df/default-graph? node)))
    (testing "with non-default graph"
      (is (not (rdf.df/default-graph? {})))
      (is (not (rdf.df/default-graph? [])))
      (is (not (rdf.df/default-graph? #{}))))))

;; Check that the predicate quad? correctly detects Quad instances.
(deftest quad?-test
  (let [quad (Quad.)]
    (testing "with quad"
      (is (rdf.df/quad? quad)))
    (testing "with non-quad"
      (is (not (rdf.df/quad? {})))
      (is (not (rdf.df/quad? [])))
      (is (not (rdf.df/quad? #{}))))))

;; TODO term?-test
;; TODO subject-term?-test
;; TODO predicate-term?-test
;; TODO object-term?-test
;; TODO graph-term?-test

;; Node Tests
;; -----------------------------------------------------------------------------
;; TODO test named node with prefix.

;; Ensure that an RDF/js BlankNode instance is correctly converted to
;; RDF/cljs.
(deftest blank-node-test
  (testing "with a non-prefixed blank node name"
    ;; Test using a non-prefixed blank node name.
    (let [value "b0"
          node (blank-node value)
          term (rdf.df/blank-node->value node)]
      (is (map? term))
      (is (= :rdf.term/blank-node (:rdf/type term)))
      (is (= value (:value term)))
      (is (malli/validate spec.quad/blank-node term))))

  (testing "with a prefixed blank node name"
    ;; Test using a prefixed node name (having a prefix of "_:"). The
    ;; stored name value should be stripped of its prefix.
    (let [name "b0"
          prefixed (str/join ":" ["_" name])
          node (blank-node prefixed)
          term (rdf.df/blank-node->value node)]
      (is (map? term))
      (is (= :rdf.term/blank-node (:rdf/type term)))
      (is (= name (:value term)))
      (is (malli/validate spec.quad/blank-node term)))))

;; Ensure that an RDF/js NamedNode instance is correctly converted to
;; RDF/cljs.
(deftest named-node-test
  (let [value "https://schema.org/url"
        node (named-node value)
        term (rdf.df/named-node->value node)]
    (is (map? term))
    (is (= :rdf.term/named-node (:rdf/type term)))
    (is (= value (:value term)))
    (is (malli/validate spec.quad/named-node term))))

;; Ensure that an RDF/js Literal instance is correctly converted to
;; RDF/cljs.
;;
;; NB: If the literal has a language, its datatype has the IRI
;; "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString". Otherwise, if
;; no datatype is explicitly specified, the datatype has the IRI
;; "http://www.w3.org/2001/XMLSchema#string".
(deftest literal-test
  ;; Language is provided, not datatype; the datatype value must be
  ;; rdf-lang-uri.
  (testing "with language"
    (let [value "cheese"
          language "en"
          literal-term (literal value language)
          term (rdf.df/literal->value literal-term)]
      (is (map? term))
      (is (= :rdf.term/literal (:rdf/type term)))
      (is (= language (:language term)))
      (is (= value (:value term)))
      (is (malli/validate spec.quad/literal term))
      ;; Check that the datatype is converted to a RDF/cljs named node map
      ;; with the expected type URI (in this case, of an XML String).
      (let [term-datatype (:datatype term)]
        (is (map? term-datatype))
        (is (= :rdf.term/named-node (:rdf/type term-datatype)))
        (is (= rdf-lang-uri (:value term-datatype)))
        (is (malli/validate spec.quad/named-node term-datatype)))))

  ;; No language or datatype provided; the datatype URI should be
  ;; xml-string-uri.
  (testing "with implicit datatype"
    (let [value "olives"
          literal-term (literal value)
          term (rdf.df/literal->value literal-term)]
      (is (map? term))
      (is (= :rdf.term/literal (:rdf/type term)))
      (is (= value (:value term)))
      (is (not (contains? term :language)))
      (is (malli/validate spec.quad/literal term))
      ;; Check that the datatype is converted to a RDF/cljs named node
      ;; map with the expected type URI (in this case, xml-string-uri).
      (let [term-datatype (:datatype term)]
        (is (map? term-datatype))
        (is (= :rdf.term/named-node (:rdf/type term-datatype)))
        (is (= xml-string-uri (:value term-datatype)))
        (is (malli/validate spec.quad/named-node term-datatype)))))

  ;; An explicit datatype is provided; the datatype URI must match the
  ;; provided value.
  (testing "with explicit datatype"
    (let [value "crackers"
          example-uri "http://example.org/some-type#rdf-string"
          datatype (named-node example-uri)
          literal-term (literal value datatype)
          term (rdf.df/literal->value literal-term)]
      (is (map? term))
      (is (= :rdf.term/literal (:rdf/type term)))
      (is (= value (:value term)))
      (is (not (contains? term :language)))
      (is (malli/validate spec.quad/literal term))
      ;; Check that the datatype is converted to a RDF/cljs named node
      ;; map with the expected type URI (in this case, example-uri).
      (let [term-datatype (:datatype term)]
        (is (map? term-datatype))
        (is (= :rdf.term/named-node (:rdf/type term-datatype)))
        (is (= example-uri (:value term-datatype)))
        (is (malli/validate spec.quad/named-node term-datatype))))))

(deftest variable-test
  ;; The variable is stored with any leading "?" stripped off.
  (testing "with leading '?'"
    (let [name "a"
          value (str "?" name)
          variable-term (variable value)
          term (rdf.df/variable->value variable-term)]
      (is (map? term))
      (is (= :rdf.term/variable (:rdf/type term)))
      (is (= name (:value term)))
      (is (malli/validate spec.quad/variable term))))

  ;; Handle variable names that are provided without a leading "?".
  (testing "without leading '?'"
    (let [name "a"
          variable-term (variable name)
          term (rdf.df/variable->value variable-term)]
      (is (map? term))
      (is (= :rdf.term/variable (:rdf/type term)))
      (is (= name (:value term)))
      (is (malli/validate spec.quad/variable term)))))

(deftest default-graph-test
  (let [graph-term (default-graph)
        term (rdf.df/default-graph->value graph-term)]
    (is (map? term))
    (is (= :rdf.term/default-graph (:rdf/type term)))
    (is (= "" (:value term)))
    (is (malli/validate spec.quad/default-graph term))))

(deftest subject-test
  (testing "with blank node"
    ;; TODO
    )
  (testing "with named node"
    ;; TODO
    )
  (testing "with variable"
    ;; TODO
    )
  (testing "with quad"
    ;; TODO
    ))

(deftest predicate-test
  (testing "with named node"
    ;; TODO
    )
  (testing "with variable"
    ;; TODO
    ))

(deftest object-test
  (testing "with blank node"
    ;; TODO
    )
  (testing "with named node"
    ;; TODO
    )
  (testing "with literal"
    ;; TODO
    )
  (testing "with variable"
    ;; TODO
    ))

(deftest graph-test
  (testing "with blank node"
    ;; TODO
    )
  (testing "with named node"
    ;; TODO
    )
  (testing "with variable"
    ;; TODO
    )
  (testing "with default graph"
    ;; TODO
    ))

(deftest quad-test
  (let [subject-value "foo"
        predicate-value "bar"
        var-name "baz"
        object-value (str "?" var-name)
        quad-term (quad (blank-node subject-value)
                        (named-node predicate-value)
                        (variable object-value)
                        (default-graph))
        term (rdf.df/quad->value quad-term)]
    (is (map? term))
    (is (= :rdf.term/quad (:rdf/type term)))
    (is (= subject-value (get-in term [:rdf.quad/subject :value])))
    (is (= predicate-value (get-in term [:rdf.quad/predicate :value])))
    (is (= var-name (get-in term [:rdf.quad/object :value])))
    (is (= "" (get-in term [:rdf.quad/graph :value])))
    (malli/validate spec.quad/quad-schema term)))
