(ns com.kubelt.rpc.schema.expand
  "Expand an OpenRPC document to replace internal references to components
  by the referred value."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [clojure.zip :as zip])
  (:require
   [com.kubelt.rpc.schema.util :as rpc.schema.util]))

(defn map-entry
  [k v]
  (clojure.lang.MapEntry/create k v))

;; An OpenRPC schema is defined as JSON, which we see after parsing into
;; edn. Therefore the only collection types we need to care about are
;; JSON arrays and objects which after parsing are vectors and maps.
(def branch?
  ;; Returns a fn that returns true if any of the predicates returns
  ;; returns true. Short-circuits.
  (some-fn map? map-entry? vector?))

;; Returns a seq of the children of a branch node. The only types we see
;; here are those for which (branch?) returns true, so in this case
;; maps, vectors, and map entries.
(defn children
  [x]
  (cond
    ;; map, vector
    (or (map? x) (vector? x))
    (seq x)
    ;; map entry with map val
    (and (map-entry? x) (-> x val map?))
    (-> x val seq)))

;; Given an existing node and a seq of children, return new branch node
;; with the supplied children.
(defn make-node
  [x children]
  (println "make-node(x):")
  (prn x)
  (prn (type x))
  (println "make-node(children):")
  (prn children)
  (prn (type children))
  (println "--------")

  children
  #_(cond
    (or (map? x) (vector? x))
    (into (empty x) children)
    ;; If x is not a map or vector, it can only be map entry.
    :else
    (let [k (key x)
          v (into (empty (val x)) children)]
      (map-entry k v))))

;; TODO move to rpc.schema.zip
;; TODO test test test
(defn schema-zip
  [root]
  (zip/zipper branch? children make-node root))

(defn ref-loc?
  [loc]
  (let [node (zip/node loc)
        is-ref? (and (map? node) (contains? node :$ref))]
    is-ref?))

;; NB: must return a loc that is *just before* the next loc of
;; interest (in a depth-first traversal).
(defn replace-ref
  "Replaces an OpenRPC reference by the corresponding definition. Expects
  a parsed OpenRPC schema as edn that contains the referenced
  definition, and a zipper loc pointing at a reference (a map containing
  a :$ref keyword whose value symbolically links to a definition
  supplied elsewhere in the document)."
  [schema loc]
  (zip/edit loc
            (fn [node schema]
              (println "replace-ref(node):")
              (prn node)
              ;; We know that node is a {:$ref "..."} map, as this fn is
              ;; only invoked when (ref-loc?) returns true.
              (let [$ref (get node :$ref)
                    ;; Returns a map containing a JSON Schema definition for
                    ;; the type, or nil if definition lookup failed.
                    ref-def (rpc.schema.util/lookup $ref schema)]
                ;;(assert (not (nil? ref-def)))
                (assert (map? ref-def))
                ref-def))
            schema))

;; expand
;; -----------------------------------------------------------------------------

(defn expand
  "Return a version of the schema where all $ref links are replaced by the
  referenced definitions."
  [schema]
  {:pre [(map? schema)]}
  ;; TODO transform ref maps using (util/lookup schema ref-map)
  (loop [loc (schema-zip schema)]
    (if (zip/end? loc)
      (zip/root loc)
      (recur (zip/next (cond
                         (ref-loc? loc)
                         (replace-ref schema loc)
                         :else loc))))))
