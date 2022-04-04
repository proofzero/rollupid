(ns com.kubelt.spec.multipart
  "Defines a spec for multipart form data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Quad
;; -----------------------------------------------------------------------------

;; TODO the subject can also potentially be a Quad term. This requires
;; that we define a recursive schema:
;; https://github.com/metosin/malli#recursive-schemas
;; (def subject
;;   [:or blank-node named-node variable])

;; (def predicate
;;   [:or named-node variable])

;; (def object
;;   [:or blank-node named-node literal variable])

;; (def graph
;;   [:or default-graph named-node blank-node variable])

;; ;; Defines the schema for an RDF/cljs quad.
;; (def quad
;;   [:map
;;    [:rdf/type [:enum :rdf.term/quad]]
;;    [:rdf.quad/subject subject]
;;    [:rdf.quad/predicate predicate]
;;    [:rdf.quad/object object]
;;    [:rdf.quad/graph graph]])

;; ;; An RDF/cljs quad with some properties attached to the schema for
;; ;; introspection.
;; (def quad-schema
;;   [:and
;;    {:name "Quad"
;;     :description "An RDF/cljs quad."
;;     :example {:rdf.quad/subject {:rdf/type :rdf.term/blank-node
;;                                  :value "b0"}
;;               :rdf.quad/predicate {:rdf/type :rdf.term/named-node
;;                                    :value "https://schema.org/name"}
;;               :rdf.quad/object {:rdf/type :rdf.term/literal
;;                                 :datatype {:type :rdf/named-node
;;                                            :value "http://www.w3.org/2001/XMLSchema#string"}
;;                                 :value "Kubelt"}
;;               :rdf.quad/graph {:rdf/type :rdf.term/named-node
;;                                :value "my-graph"}}}
;;    quad])

;; Triple
;; -----------------------------------------------------------------------------

;; An RDF/cljs triple is a Quad with the graph component set to the
;; default graph term.
;; (def triple
;;   [:map
;;    [:rdf/type [:enum :rdf.term/quad]]
;;    [:rdf.quad/subject subject]
;;    [:rdf.quad/predicate predicate]
;;    [:rdf.quad/object object]
;;    [:rdf.quad/graph default-graph]])

;; (def triple-schema
;;   [:and
;;    {:name "Triple"
;;     :description "An RDF/cljs triple."
;;     :example {:rdf.quad/subject {:rdf/type :rdf.term/blank-node
;;                                  :value "b0"}
;;               :rdf.quad/predicate {:rdf/type :rdf.term/named-node
;;                                    :value "https://schema.org/name"}
;;               :rdf.quad/object {:rdf/type :rdf.term/literal
;;                                 :datatype {:type :rdf/named-node
;;                                            :value "http://www.w3.org/2001/XMLSchema#string"}
;;                                 :value "Kubelt"}
;;               :rdf.quad/graph {:rdf/type :rdf.term/default-graph
;;                                :value ""}}}
;;    triple])

;; Multipart
;; -----------------------------------------------------------------------------

(def multipart-type
  [:enum "multipart/form-data"])

(def part
  [:map
   [:com.kubelt/type [:enum :kubelt.type/multipart.part]]
   [:part/name :string]
   [:part/file-name {:optional true} :string]
   [:part/data :any]
   [:part/length :int]
   [:part/media-type :string]])

(def multipart
  [:map
   [:com.kubelt/type [:enum :kubelt.type/multipart]]
   [:multipart/media-type multipart-type]
   [:multipart/boundary :string]
   [:multipart/length :int]
   [:multipart/max-length {:optional true} :int]
   [:multipart/parts [:vector part]]])
