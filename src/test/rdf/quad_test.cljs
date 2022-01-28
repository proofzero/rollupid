(ns rdf.quad-test
  "Test the implementation of RDF/cljs quads."
  (:require
   [cljs.test :as t :refer [deftest is use-fixtures]])
  (:require
   ["rdf-data-factory" :refer
    [Quad]])
  (:require
   [com.kubelt.sdk.impl.rdf.quad :as rdf.quad]))

;; TODO rename to reflect namespace where RDF store quads are
;; implemented.

;; Utilities
;; -----------------------------------------------------------------------------

;; (defn quad->subject
;;   "Retrieve the subject value from a Quad instance."
;;   [^Quad quad]
;;   (.-value (.-subject quad)))

;; (defn quad->predicate
;;   "Retrieve the predicate value from a Quad instance."
;;   [^Quad quad]
;;   (.-value (.-predicate quad)))

;; (defn quad->object
;;   "Retrieve the object value from a Quad instance."
;;   [^Quad quad]
;;   (.-value (.-object quad)))

;; (defn quad->graph
;;   "Retrieve the graph value from a Quad instance."
;;   [^Quad quad]
;;   (.-value (.-graph quad)))

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

;; TODO should we have a type registry, i.e. a map from keyword to XML
;; Schema datatype IRI? e.g.
;; :schema/string => "http://www.w3.org/2001/XMLSchema#string

;; (def xml-schema
;;   #:schema {:string "http://www.w3.org/2001/XMLSchema#string"})

;; (def pikachu-map
;;   #::rdf.quad {:subject :pok/pikachu
;;                :predicate :pok/hasName
;;                :object "Pikachu"})

;; ;; TODO test usage of fully expanded quads like this:
;; (def pikachu-full-map
;;   #::rdf.quad {:subject {:term/type :type/named
;;                          :term/value "pok:pikachu"}
;;                :predicate {:term/type :type/named
;;                            :term/value "pok:hasName"}
;;                :object {:term/type :type/literal
;;                         :term/value "Robert"
;;                         :term/datatype {:type/type :type/named
;;                                         :type/value :schema/string}}})

;; (def pikachu-vec
;;   [:pok/pikachu :pok/hasName "Pikachu"])

;; Tests
;; -----------------------------------------------------------------------------
;; TODO test quad creation when keywords are not namespaced
;; TODO test quad creation when supplying values as strings
;; TODO test quad creation when using full IRIs (should be compacted if
;; a matching prefix is registered)

;;
;; Quad
;;

;; (deftest map->quad-test
;;   "Define a quad as a Clojure map without specifying the graph
;;   component. The resulting Quad instance should be a part of the quad
;;   store's default graph."
;;   (let [q (rdf.quad/map->quad pikachu-map)]
;;     (is (= (type q) Quad))
;;     (is (= (quad->subject q) "pok:pikachu"))
;;     (is (= (quad->predicate q) "pok:hasName"))
;;     (is (= (quad->object q) "Pikachu"))
;;     (is (= (quad->graph q) ""))))

;; (deftest map+graph->quad-test
;;   "Define a quad as a Clojure map, specifying the graph component. The
;;   resulting quad should have the correct graph component."
;;   (let [m (assoc pikachu-map ::rdf.quad/graph :pebble-cave)
;;         q (rdf.quad/map->quad m)]
;;     (is (= (type q) Quad))
;;     (is (= (quad->subject q) "pok:pikachu"))
;;     (is (= (quad->predicate q) "pok:hasName"))
;;     (is (= (quad->object q) "Pikachu"))
;;     (is (= (quad->graph q) "pebble-cave"))))

;; (deftest vec->quad-test
;;   "Define a quad as a Clojure vector without specifying the graph
;;   component. The resulting Quad instance should be a part of the quad
;;   store's default graph."
;;   (let [q (rdf.quad/vec->quad pikachu-vec)]
;;     (is (= (type q) Quad))
;;     (is (= (quad->subject q) "pok:pikachu"))
;;     (is (= (quad->predicate q) "pok:hasName"))
;;     (is (= (quad->object q) "Pikachu"))
;;     (is (= (quad->graph q) ""))))

;; (deftest vec+graph->quad-test
;;   "Define a quad as a Clojure vector, specifying the graph
;;   component. The resulting Quad instance should have the correct graph
;;   component."
;;   (let [v (conj pikachu-vec :pebble-cave)
;;         q (rdf.quad/vec->quad v)]
;;     (is (= (type q) Quad))
;;     (is (= (quad->subject q) "pok:pikachu"))
;;     (is (= (quad->predicate q) "pok:hasName"))
;;     (is (= (quad->object q) "Pikachu"))
;;     (is (= (quad->graph q) "pebble-cave"))))
