(ns json-ld-test
  "Test JSON-LD conversion to RDF."
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.java.io :as io]
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli])
  #?(:clj
     (:require
      [jsonista.core :as json]))
  (:require
   [com.kubelt.rdf.json-ld :as rdf.json-ld]
   [com.kubelt.spec.rdf :as spec.rdf]))

;; The contents of:
;;
;;   https://w3c.github.io/json-ld-api/tests/
;;
;; are stored locally in the fixtures/json-ld/tests/ directory, as a
;; local copy is recommended practice.

(def string-uri
  "http://www.w3.org/2001/XMLSchema#string")

(def string+lang-uri
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")

(def date-uri
  "http://www.w3.org/2001/XMLSchema#date")

(def default-graph
  {:rdf/type :rdf.term/default-graph :value ""})

(defn quad
  [subject predicate object graph]
  {:rdf/type :rdf.term/quad
   :rdf.quad/subject subject
   :rdf.quad/predicate predicate
   :rdf.quad/object object
   :rdf.quad/graph graph})

;; TODO slurp io/resource json/parse [generic lib.json x-platform]
;; TODO slurp io/resource rdf/parse (nq) [generic lib.rdf x-platform]
;; TODO ensure everything runs x-platform

;; Add a test to the given namespace. The body of the test is given
;; as the thunk test-fn. Useful for adding dynamically generated
;; deftests.
(defn add-test
  [test-name test-ns test-fn & [metadata]]
  (intern test-ns (with-meta (symbol test-name)
                    (merge metadata {:test #(test-fn)}))
          (fn [])))

;; Construct a test function that checks the input (a JSON-LD document
;; loaded from the test fixture directory) against the expected output,
;; a collection of RDF/cljc quads (loaded from the .nq file
;; corresponding to the test input).
(defn make-rdf-test-fn [input expected]
  (fn []
    (let [output (rdf.json-ld/to-rdf input)]
      (is (malli/validate spec.rdf/quad output)
          "generated quad is valid RDF/cljc")
      (is (= expected output)
          "quad matches expected output"))))

;; The test manifest (a JSON-LD file) contains a collection of test
;; definitions under the "sequence" key. A test definition looks like:
;;
;;   {"@id" "#twf02"
;;    "option" {"specVersion" "json-ld-1.1"}
;;    "expect" "toRdf/wf02-out.nq"
;;    "name" "Triples including invalid predicate IRIs are rejected"
;;    "input" "toRdf/wf02-in.jsonld"
;;    "@type" ["jld:PositiveEvaluationTest" "jld:ToRDFTest"]
;;    "purpose" "ToRdf emits only well-formed statements."}
;;
;; Load and parse the manifest and for each extracted test definition,
;; instantiate a clojure.test.
(defn run-manifest
  "Takes a object containing a test manifest from the W3C JSON-LD
  conformance suite, and defines a test that loads the input, processes
  it using (rdf.json-ld/to-rdf), and compares the output with expect
  n-quad output (suitably translated into our RDF/cljc format)."
  [base-path manifest-file]
  (let [manifest-path (str/join "/" [base-path manifest-file])
        manifest-str (slurp manifest-path)
        mapper json/default-object-mapper
        manifest (json/read-value manifest-str mapper)]
    (doseq [;; Get a manifest entry (map) describing test to perform.
            test-map (get manifest "sequence")]
      (let [;; Path to input JSON-LD file.
            input-rel (get test-map "input")
            input-path (str/join "/" [base-path input-rel])
            input (json/read-value (slurp input-path))
            ;; Expected output n-quads.
            ;; TODO parse n-quads into RDF/cljc
            expected (when (contains? test-map "expect")
                       (let [rel-path (get test-map "expect")
                             path (str/join "/" [base-path rel-path])]
                         (slurp path)))

            test-id (-> test-map (get "@id") (str/replace #"^#" ""))
            test-desc (get test-map "name")
            test-purpose (get test-map "purpose")
            ;; TODO pass in test metadata.
            rdf-test-fn (make-rdf-test-fn input expected)]
        (add-test test-id 'json-ld-test rdf-test-fn)))))

(defn find-repo-root
  []
  (let [git-dir (io/file ".git")]
    (loop [git-file (.getAbsoluteFile git-dir)]
      (if (.isDirectory git-dir)
        (.getParent git-file)
        (recur (.getParentFile git-file))))))

(defn repo-path
  "Return an absolute path relative to the repository root."
  [rel-path]
  (let [repo-root (find-repo-root)]
    (str/join "/" [repo-root rel-path])))

(let [test-path (repo-path "rdf/json-ld/tests")
      manifest-file "toRdf-manifest.jsonld"]
  (run-manifest test-path manifest-file))
