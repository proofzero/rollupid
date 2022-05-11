(ns com.kubelt.rpc.path
  "Path-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.spec.rpc :as spec.rpc]))

;; path?
;; -----------------------------------------------------------------------------

(defn path?
  "Return true if the argument is an RPC path, i.e. a method name that has
  been converted into structured data (a vector of keywords), and false
  otherwise."
  [x]
  (malli/validate spec.rpc/path x))

;; path->str
;; -----------------------------------------------------------------------------

(defn path->str
  "Convert a path, a structured data value representing the name of an RPC
  call, into the string equivalent."
  ([path]
   (let [separator "_"]
     (path->str path separator)))
  ([path separator]
   (cstr/join separator (map name path))))

;; filter-depth
;; -----------------------------------------------------------------------------

(defn filter-depth
  "Take a sequence of paths and trim each path be of the given
  length. Returns a set."
  [paths depth]
  (letfn [(trim-depth [v path]
            ;; If depth is greater than the length of the path, we
            ;; include the path without any further processing.
            (if (> depth (count path))
              (conj v path)
              (let [path (vec (first (partition depth path)))]
                (conj v path))))]
    (reduce trim-depth #{} paths)))

;; filter-search
;; -----------------------------------------------------------------------------

(defn filter-search
  "Filter a sequence of paths to include only those containing a given
  search string. Returns a set."
  [paths search]
  {:pre [(string? search)]}
  (let [pattern (re-pattern (str ".*" search ".*"))]
    (letfn [(match-kw [kw]
              (re-matches pattern (name kw)))
            (matches? [path]
              (not-empty (filter match-kw path)))
            (match-search [a-set path]
              (if (matches? path)
                (conj a-set path)
                a-set))]
      (reduce match-search #{} paths))))

;; filter-prefix
;; -----------------------------------------------------------------------------

(defn filter-prefix
  "Return only those paths that have the given path prefix. For example,
  if path contains [:foo :bar], only paths that begin with that sequence
  of keywords will be returned, e.g. [:foo :bar :baz]."
  [paths prefix]
  (letfn [(pair= [[a b]]
            (= a b))
          (has-prefix? [prefix path]
            (let [pairs (partition 2 (interleave prefix path))]
              (every? pair= pairs)))
          (match-path [a-set path]
            (if (has-prefix? prefix path)
              (conj a-set path)
              a-set))]
    (reduce match-path #{} paths)))
