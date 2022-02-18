(ns com.kubelt.rdf.n-quad
  "Parse and convert n-quads."
  {:author "ⓒ2022 Kubelt Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as cstr])
  #?(:clj
     (:require
      [instaparse.core :as insta :refer [defparser]])
     :cljs
     (:require
      [instaparse.core :as insta :refer-macros [defparser]]))
  (:require
   [com.kubelt.rdf.util :as rdf.util]))

;; Definitions
;; -----------------------------------------------------------------------------

(def string-uri
  "http://www.w3.org/2001/XMLSchema#string")

(def string+lang-uri
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")


;; Notes:
;; - we use production "named-node" for what is referred to in the
;;   grammar as an "iri-ref" to make the parsed output clearer
;; - we use < and > around characters to avoid including those
;;   characters in the parsed output. Confusingly, some of the the
;;   characters we want to exclude are '<' and '>'.
;;
;; TODO support comments beginning with '#' at end of line or at beginning:
;; <http://one.example/subject1> <http://one.example/predicate1> <http://one.example/object1> <http://example.org/graph3> . # comments here
;; # or on a line by themselves
(defparser nq-parser
  "n-quads = quad? (<eol> quad)* <eol?>
   quad = subject <ws> predicate <ws> object <ws> graph? <ws>? <'.'>
   subject = named-node | blank-node
   predicate = named-node
   object = named-node | blank-node | literal
   graph = named-node | blank-node
   literal = string (<'^^'> named-node | language)?

   <ws> = #'\\s+'
   <eol> = #'\\s*[\r\n]+'
   language = <'@'> #'[a-zA-Z]+(-[a-zA-Z0-9]+)*'
   named-node = <'<'> #'[^\u0000-\u0020<>{}\"|^`]*' <'>'>
   string = <'\"'> #'[^\\x{22}\\x{5c}\\x{a}\\x{d}]*' <'\"'>
   blank-node = <'_:'> #'[a-z][0-9]+'

   (* <decimal> = #'\\d' *)
   (* <hex> = #'[0-9A-Fa-f]' *)")

;; [:named-node "http://greggkellogg.net/foaf#me"]
;; =>
;; {:rdf/type :rdf.term/named-node
;;  :value "http://greggkellogg.net/foaf#me"}
(defn- named-node
  [s]
  {:rdf/type :rdf.term/named-node
   :value s})

;; [:blank-node "b0"]
;; =>
;; {:rdf/type :rdf.term/blank-node
;;  :value "b0"}
(defn- blank-node
  "Convert a blank node name to an RDF/cljc blank node map."
  [s]
  (let [value (rdf.util/remove-blank-prefix s)]
    {:rdf/type :rdf.term/blank-node
     :value value}))

;; [:literal
;;  [:string "Gregg Kellogg"]
;;  [:language "en"]
;;  [:named-node "http://example.com#me"]]
;; =>
;; {:rdf/type :rdf.term/literal
;;  :datatype {:rdf/type :rdf.term/named-node
;;             :value "http://example.com#me"}
;;  :language "en"
;;  :value "Gregg Kellogg"}
(defn- literal
  ""
  [literal-vec]
  (letfn [(type-kw->map [[type-kw value]]
            (condp = type-kw
              :string {:value value}
              :language {:language value
                         :datatype (named-node string+lang-uri)}
              :named-node {:datatype (named-node value)}))
          (to-map [m v]
            (let [part-map (type-kw->map v)]
              (merge m part-map)))]
    (let [default-map {:rdf/type :rdf.term/literal
                       :datatype (named-node string-uri)}]
      (reduce to-map default-map literal-vec))))

;; [:subject [:named-node "http://greggkellogg.net/foaf#me"]]
;; [:blank-node "b0"]
(defn- v->subject
  [[_ v]]
  (let [subject (condp = (first v)
                  :named-node (named-node (second v))
                  :blank-node (blank-node (second v)))]
    {:rdf.quad/subject subject}))

(defn- v->predicate
  [[_ v]]
  (let [predicate v]
    (let [predicate (named-node (second v))]
      {:rdf.quad/predicate predicate})))

(defn- v->object
  [[_ v]]
  (let [object (condp = (first v)
                 :named-node (named-node (second v))
                 :blank-node (blank-node (second v))
                 :literal (literal (rest v)))]
    {:rdf.quad/object object}))

(defn- v->graph
  [[_ v]]
  (if-not v
    (let [default-graph {:rdf/type :rdf.term/default-graph :value ""}]
      {:rdf.quad/graph default-graph})
    (let [graph (condp = (first v)
                  :named-node (named-node (second v))
                  :blank-node (blank-node (second v)))]
      {:rdf.quad/graph graph})))

;; Public
;; -----------------------------------------------------------------------------

;; TODO ask for raw output, RDF/cljc (map), RDF/cljc (vec).
;; TODO convert parse errors into our standard error format.
;; TODO create lib.error namespace for constructing error maps (anomalies?)

(defn parse-string
  [s]
  (let [result (nq-parser s)]
    (if (= :n-quads (first result))
      (mapv (fn [[_ s p o g]]
              (merge
               {:rdf/type :rdf.term/quad}
               (v->subject s)
               (v->predicate p)
               (v->object o)
               (v->graph g)))
            (rest result))
      {:com.kubelt/type :kubelt.type/error
       :error result})))

(defn parse-file
  [path]
  ;; TODO
  )
