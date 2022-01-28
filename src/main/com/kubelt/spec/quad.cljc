(ns com.kubelt.spec.quad
  "Defines a spec for RDF/cljs to enable validation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; We use the default vector-based format for ease of authoring, but if
;; performance issues arise it may be more efficient to switch to
;; the "Schema AST" map-based syntax instead as that should be faster to
;; instantiate for large schemas.

;; Language
;; -----------------------------------------------------------------------------
;; Language strings must be as defined by:
;;   BCP-47: Tags for Identifying Languages
;; Cf. https://www.rfc-editor.org/rfc/rfc5646

;; TODO flesh this out. Use regex validator(s)?
(def language
  [:string {:min 2 :max 5}])

;; Term
;; -----------------------------------------------------------------------------
;; A "quad" is (unsurprisingly) comprised of four components: the
;; subject, predicate, object, and the graph. A "term" is an abstract
;; interface that any quad component implements. Terms may be of a
;; number of types:
;;
;; - blank node
;; - named node
;; - literal
;; - variable
;; - default graph
;; - quad
;;
;; Terms are defined to be maps in RDF/cljs. At a minimum, every term
;; has a concrete type that is available as the value of the
;; key :rdf/type. Every term also has a string value.

(def term
  [:map
   [:rdf/type keyword?]
   [:value string?]])

(def blank-node
  [:and
   term
   [:map
    [:rdf/type [:enum :rdf.term/blank-node]]]])

(def named-node
  [:and
   term
   [:map
    [:rdf/type [:enum :rdf.term/named-node]]]])

(def literal
  [:and
   term
   [:map
    [:rdf/type [:enum :rdf.term/literal]]
    [:language {:optional true} language]
    [:datatype named-node]]])

;; A Variable value contains the name of the variable without any
;; leading "?".
(def variable
  [:and
   term
   [:map
    [:rdf/type [:enum :rdf.term/variable]]]])

;; The value of a Default Graph must always be the empty string.
(def default-graph
  [:and
   term
   [:map
    [:rdf/type [:enum :rdf.term/default-graph]]
    [:value [:enum ""]]]])

;; Quad
;; -----------------------------------------------------------------------------

;; TODO the subject can also potentially be a Quad term. This requires
;; that we define a recursive schema:
;; https://github.com/metosin/malli#recursive-schemas
(def subject
  [:or blank-node named-node variable])

(def predicate
  [:or named-node variable])

(def object
  [:or blank-node named-node literal variable])

(def graph
  [:or default-graph named-node blank-node variable])

;; Defines the schema for an RDF/cljs quad.
(def quad
  [:map
   [:rdf/type [:enum :rdf.term/quad]]
   [:rdf.quad/subject subject]
   [:rdf.quad/predicate predicate]
   [:rdf.quad/object object]
   [:rdf.quad/graph graph]])

;; An RDF/cljs quad with some properties attached to the schema for
;; introspection.
(def quad-schema
  [:and
   {:name "Quad"
    :description "An RDF/cljs quad."
    :example {:rdf.quad/subject {:rdf/type :rdf.term/blank-node
                                 :value "b0"}
              :rdf.quad/predicate {:rdf/type :rdf.term/named-node
                                   :value "https://schema.org/name"}
              :rdf.quad/object {:rdf/type :rdf.term/literal
                                :datatype {:type :rdf/named-node
                                           :value "http://www.w3.org/2001/XMLSchema#string"}
                                :value "Kubelt"}
              :rdf.quad/graph {:rdf/type :rdf.term/named-node
                               :value "my-graph"}}}
   quad])

;; Triple
;; -----------------------------------------------------------------------------

;; An RDF/cljs triple is a Quad with the graph component set to the
;; default graph term.
(def triple
  [:map
   [:rdf/type [:enum :rdf.term/quad]]
   [:rdf.quad/subject subject]
   [:rdf.quad/predicate predicate]
   [:rdf.quad/object object]
   [:rdf.quad/graph default-graph]])

(def triple-schema
  [:and
   {:name "Triple"
    :description "An RDF/cljs triple."
    :example {:rdf.quad/subject {:rdf/type :rdf.term/blank-node
                                 :value "b0"}
              :rdf.quad/predicate {:rdf/type :rdf.term/named-node
                                   :value "https://schema.org/name"}
              :rdf.quad/object {:rdf/type :rdf.term/literal
                                :datatype {:type :rdf/named-node
                                           :value "http://www.w3.org/2001/XMLSchema#string"}
                                :value "Kubelt"}
              :rdf.quad/graph {:rdf/type :rdf.term/default-graph
                               :value ""}}}
   triple])

;; Knowledge Graph
;; -----------------------------------------------------------------------------

(def knowledge-graph
  [:map
   [:rdf/type :rdf.type/graph]
   [:quads [:vector quad]]])
