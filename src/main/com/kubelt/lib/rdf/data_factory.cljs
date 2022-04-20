(ns com.kubelt.lib.rdf.data-factory
  "Generate RDF/cljs quads from RDF/js data factory instances."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
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
   [clojure.string :as str])
  (:require
   [com.kubelt.lib.rdf.util :as rdf.util]))

;; Predicates
;; -----------------------------------------------------------------------------

(defn blank-node?
  "Returns true if given a BlankNode instance, and false otherwise."
  [term]
  (and
   (identical? (.-constructor term) BlankNode)
   (= (.-termType "BlankNode"))))

(defn named-node?
  "Returns true if given a NamedNode instance, and false otherwise."
  [term]
  (and
   (identical? (.-constructor term) NamedNode)
   (= (.-termType "NamedNode"))))

(defn literal?
  "Returns true if given a Literal instance, and false otherwise."
  [^Literal term]
  (and
   (identical? (.-constructor term) Literal)
   (= (.-termType term) "Literal")))

(defn variable?
  "Returns true if given a Variable instance, and false otherwise."
  [^Variable term]
  (and
   (identical? (.-constructor term) Variable)
   (= (.-termType term) "Variable")))

(defn default-graph?
  "Returns true if given a DefaultGraph instance, and false otherwise."
  [^DefaultGraph term]
  (and
   (identical? (.-constructor term) DefaultGraph)
   (= (.-termType term) "DefaultGraph")))

(defn quad?
  "Returns true if given an rdf-data-factory Quad object."
  [^Quad o]
  (and
   ;; Check that object was constructed from Quad.
   (identical? (.-constructor o) Quad)
   ;; Check the the term type has the expected value.
   (= (.-termType "Quad"))))

(defn term?
  "Returns true if given value is an RDF.Term, and false otherwise."
  [^RDF.Term term]
  (and
   (js/Object.hasOwnProperty term "termType")
   (js/Object.hasOwnProperty term "value")))

(defn subject-term?
  "Returns true if given value is a valid RDF/js subject term."
  [^RDF.Term term]
  (or (blank-node? term)
      (named-node? term)
      (variable? term)
      (quad? term)))

(defn predicate-term?
  "Returns true if given value is a valid RDF/js predicate term."
  [^RDF.Term term]
  (or (named-node? term)
      (variable? term)))

(defn object-term?
  "Returns true if given value is a valid RDF/js object term."
  [^RDF.Term term]
  (or (blank-node? term)
      (named-node? term)
      (literal? term)
      (variable? term)))

(defn graph-term?
  "Returns true if given value is a valid RDF/js graph term."
  [^RDF.Term term]
  ;; a DefaultGraph, NamedNode, BlankNode or Variable
  (or (blank-node? term)
      (named-node? term)
      (variable? term)
      (default-graph? term)))

;; Internal
;; -----------------------------------------------------------------------------

(defn- blank-node->value
  "Convert a RDF/js BlankNode instance to RDF/cljs format."
  [^BlankNode term]
  {:pre [(blank-node? term)]}
  (let [value (.-value term)
        value (rdf.util/remove-blank-prefix value)]
    {:rdf/type :rdf.term/blank-node
     :value value}))

(defn- named-node->value
  "Convert an RDF/js NamedNode instance to RDF/cljs format."
  [^NamedNode term]
  {:pre [(named-node? term)]}
  (let [value (.-value term)
        ;; TODO expand namespace; it may be the case that we are given a
        ;; prefixed value where we need to look up the prefix and expand
        ;; it to get a full URI.
        ;;
        ;;[ns s] (str/split value ":")
        ]
    {:rdf/type :rdf.term/named-node
     :value value}))

(defn- literal->value
  "Convert an RDF/js Literal instance to RDF/cljs format."
  [^Literal term]
  {:pre [(literal? term)]}
  (let [value (.-value term)
        datatype (.-datatype term)
        datatype-map (named-node->value datatype)
        language (.-language term)
        ;; Right now, if language isn't provided, we don't set the
        ;; key. Would it be better to always store language even if as
        ;; blank string?
        language-map (if-not (str/blank? language)
                       {:language language}
                       {})]
    (merge {:rdf/type :rdf.term/literal
            :datatype datatype-map
            :value value}
           language-map)))

(defn- variable->value
  "Convert an RDF/js Variable instance to RDF/cljs format. Note that the
  name of the variable is stored without the leading '?'."
  [^Variable term]
  {:pre [(variable? term)]}
  (let [value (.-value term)
        name (rdf.util/remove-var-prefix value)]
    {:rdf/type :rdf.term/variable
     :value name}))

(defn- default-graph->value
  "Convert an RDF/js DefaultGraph instance to RDF/cljs format. The :value
  key of the returned map is always an empty string."
  [^DefaultGraph term]
  {:pre [(default-graph? term)]}
  {:rdf/type :rdf.term/default-graph
   :value ""})

;; Forward declaration; necessary because a "subject" term can itself be
;; a Quad.
(declare quad->value)

(defn- subject->value
  "Convert an RDF/js 'subject' term instance (one of the RDF.Term types
  allowed in the subject place of a quad) to RDF/cljs format."
  [^RDF.Term term]
  {:pre [(subject-term? term)]}
  (condp = (.-termType term)
    "BlankNode" (blank-node->value term)
    "NamedNode" (named-node->value term)
    "Variable" (variable->value term)
    "Quad" (quad->value term)))

(defn- predicate->value
  [^RDF.Term term]
  {:pre [(predicate-term? term)]}
  (condp = (.-termType term)
    "NamedNode" (named-node->value term)
    "Variable" (variable->value term)))

(defn- object->value
  [^RDF.Term term]
  {:pre [(object-term? term)]}
  (condp = (.-termType term)
    "BlankNode" (blank-node->value term)
    "NamedNode" (named-node->value term)
    "Literal" (literal->value term)
    "Variable" (variable->value term)))

(defn- graph->value
  [^RDF.Term term]
  {:pre [(graph-term? term)]}
  (condp = (.-termType term)
    "BlankNode" (blank-node->value term)
    "NamedNode" (named-node->value term)
    "Variable" (variable->value term)
    "DefaultGraph" (default-graph->value term)))

(defn- quad->value
  "Takes a JavaScript RDF/js Quad instance and converts it into our
  standard map-based quad representation."
  [^Quad quad]
  {:pre [(quad? quad)]}
  (let [subject (subject->value (.-subject quad))
        predicate (predicate->value (.-predicate quad))
        object (object->value (.-object quad))
        graph (graph->value (.-graph quad))]
    {:rdf/type :rdf.term/quad
     :rdf.quad/subject subject
     :rdf.quad/predicate predicate
     :rdf.quad/object object
     :rdf.quad/graph graph}))

;; Public
;; -----------------------------------------------------------------------------
