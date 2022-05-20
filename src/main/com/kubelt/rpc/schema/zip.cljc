(ns com.kubelt.rpc.schema.zip
  "A zipper for traversnig and editing OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.zip :as zip]))

;; TODO test test test

(comment
  (key (clojure.lang.MapEntry/create :schema {:xxx true}))
  (first (clojure.lang.MapEntry/create :schema {:xxx true}))

  (val (clojure.lang.MapEntry/create :schema {:xxx true}))
  (second (clojure.lang.MapEntry/create :schema {:xxx true}))

  (seq (val (clojure.lang.MapEntry/create :schema {:xxx true})))

  (empty (clojure.lang.MapEntry/create :schema {:xxx true}))

  (seq (clojure.lang.MapEntry/create :schema {:xxx true}))

  (first (rest (seq (clojure.lang.MapEntry/create :schema {:xxx true}))))

  (reverse (seq (clojure.lang.MapEntry/create :schema {:xxx true})))

  (let [me (clojure.lang.MapEntry/create :schema {:xxx true})]
    (into
     (empty (seq me))
     (seq me)))
  )

;; map-entry
;; -----------------------------------------------------------------------------
;; Construct a map entry.

(defn- map-entry
  [k v]
  (clojure.lang.MapEntry/create k v))

;; branch?
;; -----------------------------------------------------------------------------
;; An OpenRPC schema is defined as JSON, which we see after parsing into
;; edn. Therefore the only collection types we need to care about are
;; JSON arrays and objects which after parsing are vectors and maps,
;; with the possible addition of sets, which result result from some
;; post-parsing transformation.

(defn- branch?
  [node]
  (cond
    ;; Non-collection types have no children.
    (not (coll? node))
    false
    ;; If we're looking at a map entry, the children are to be found
    ;; in the value, assuming it's a collection of some sort.
    (map-entry? node)
    (coll? (val node))
    ;; We can expect to see maps and vectors after parsing JSON; some of
    ;; our schema-related transformations may consolidate a collection
    ;; into a set.
    :else
    (or (map? node) (vector? node) (set? node))))

;; children
;; -----------------------------------------------------------------------------

;; Returns a seq of the children of a branch node. The only types we see
;; here are those for which (branch?) returns true, so in this case
;; maps, sets, vectors, and map entries.
(defn- children
  [node]
  (seq (cond
         ;; map, vector, set
         (or (map? node) (vector? node) (set? node))
         node
         ;; map entry with a collection value
         (and (map-entry? node) (coll? (val node)))
         (val node))))

;; make-node
;; -----------------------------------------------------------------------------
;; Given an existing node and a seq of children, return new branch node
;; with the supplied children.

(defn- make-node
  [node children]
  ;; NB: the painful bug we saw before resulted from having these (cond)
  ;; branches in the opposite order, i.e. checking for a (map-entry?
  ;; node) *after* checking if the node was one of the supported
  ;; collection types. Dig into this a bit to make sure we understand
  ;; why that is.
  (cond
    ;; If x is not a map, set, or vector it can only be map entry.
    (map-entry? node)
    (let [k (key node)
          v (into (empty (val node)) (-> children rest first))]
      (map-entry k v))
    ;; map, vector, set.
    (or (map? node) (vector? node) (set? node))
    (into (empty node) children)))

;; schema-zip
;; -----------------------------------------------------------------------------

(defn schema-zip
  "Return a zipper over a parsed OpenRPC schema document."
  [root]
  (zip/zipper branch? children make-node root))
