(ns com.kubelt.lib.rdf.json-ld
  "Generate RDF/cljs quads from JSON-LD."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  ;; This breaks web build
  #_(:require
   ["jsonld" :as jsonld])
  (:require
   [clojure.string :as str])
  (:require
   [com.kubelt.lib.rdf.util :as util]))

;; We use JavaScript package "jsonld" to parse JSON-LD data.
;; https://github.com/digitalbazaar/jsonld.js
;;
;; jsonld.compact(doc, context)
;; jsonld.expand(compacted)
;; jsonld.flatten(doc)
;; jsonld.frame(doc, frame)
;; jsonld.canonize(doc, {
;;   algorithm: 'URDNA2015',
;;   format: 'application/n-quads',
;; })
;;
;; NB: if we don't specify an RDF output format we get back the internal
;; dataset, an array of quads:
;; jsonld.toRDF(doc, {format: 'application/n-quads'})
;;
;; jsonld.fromRDF(nquads, {format: 'application-n-quads'})

;; Internal
;; -----------------------------------------------------------------------------

(defn- named-node->value
  "Convert an RDF/js named node term map to RDF/cljs format."
  [{:keys [termType value] :as m}]
  {:pre [(= termType "NamedNode") (string? value)]}
  {:rdf/type :rdf.term/named-node
   :value value})

(defn- literal->value
  "Convert an RDF/js literal term map to RDF/cljs format. The :language
  key is optional."
  [{:keys [termType language value] :as m}]
  {:pre [(= termType "Literal")
         (or (nil? language) (string? language))
         (string? value)]}
  (let [datatype (named-node->value (:datatype m))
        lang-map (if language {:language language} {})]
    (merge {:rdf/type :rdf.term/literal
            :datatype datatype
            :value value}
           lang-map)))

(defn- default-graph->value
  "Convert an RDF/js default graph term map to RDF/cljs format."
  [{:keys [termType value] :as m}]
  {:pre [(= termType "DefaultGraph") (string? value)]}
  {:rdf/type :rdf.term/default-graph
   :value value})

(defn- blank-node->value
  "Convert an RDF/js blank node term map to RDF/cljs format."
  [{:keys [termType value] :as m}]
  {:pre [(= termType "BlankNode") (string? value)]}
  (let [;; The standard requires that serialization prefixes be removed,
        ;; e.g. the "_:" included if the data was sourced from Turtle.
        value (util/remove-blank-prefix value)]
      {:rdf/type :rdf.term/blank-node
       :value value}))

(defn- variable->value
  "Convert an RDF/js variable term map to RDF/cljs format."
  [{:keys [termType value] :as m}]
  {:pre [(= termType "Variable") (string? value)]}
  {:rdf/type :rdf.term/variable
   :value value})

;; Forward declare this name.
(declare quad->value)

(defn- node->value
  "Takes a JavaScript object representing an RDF/js Term and turns it into
  the value that should be stored in our ClojureScript quad
  representation."
  [{:keys [termType] :as m}]
  {:pre [(some? termType)]}
  (condp = termType
    "BlankNode" (blank-node->value m)
    "DefaultGraph" (default-graph->value m)
    "Literal" (literal->value m)
    "NamedNode" (named-node->value m)
    "Variable" (variable->value m)
    "Quad" (quad->value m)))

(defn- quad->value
  "Takes a JavaScript object representing a quad, as returned by
  jsonld.js, and converts it into our standard map-based quad
  representation."
  [{:keys [subject predicate object graph] :as quad-map}]
  (let [subject (node->value subject)
        predicate (node->value predicate)
        object (node->value object)
        graph (node->value graph)]
    (merge {:rdf/type :rdf.term/quad}
           #:rdf.quad {:subject subject
                       :predicate predicate
                       :object object
                       :graph graph})))

;; Public
;; -----------------------------------------------------------------------------

(defn js->graph
  "Convert RDF/js quads to RDF/cljs quads. Returns a promise that resolves
  to a vector of quad maps."
  [doc]
  (let [options (clj->js {})]
    ;; TODO replace jsonld dependency with something else; home grown?
    (js/Promise.resolve #js [])
    ;; jsonld.toRDF() returns a promise that resolves to a string
    ;; containing RDF triples.
    #_(-> (.toRDF jsonld doc options)
        (.then (fn [dataset]
                 (js->clj dataset :keywordize-keys true)))
        (.then (fn [dataset]
                 (mapv quad->value dataset)))
        (.then (fn [quads]
                 {:rdf/type :rdf.type/graph
                  :quads quads})))))
