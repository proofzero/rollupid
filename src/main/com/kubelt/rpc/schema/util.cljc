(ns com.kubelt.rpc.schema.util
  "OpenRPC schema utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [camel-snake-kebab.core :as csk]))

;; s->kw
;; -----------------------------------------------------------------------------

(defn s->kw
  "Convert a string to a keyword, transforming it into idiomatic kebab
  case."
  [s]
  (-> s keyword csk/->kebab-case))

;; name->path
;; -----------------------------------------------------------------------------
;; TODO allow to override the separator; should be passed as a
;; configuration value in the (init) options map.
;; TODO make private

(defn name->path
  "Given a string resource name, return a 'path' data value (a vector of
  keywords). Currently assumes that names use '_' as a separator between
  path components."
  [s]
  {:pre [(string? s)]}
  (let [parts (cstr/split s #"_")]
    (mapv s->kw parts)))

;; ref->path
;; -----------------------------------------------------------------------------
;; For example:
;; {:$ref "#/components/contentDescriptors/Transaction"}
;; => [:components :content-descriptors :transaction]

(defn ref->path
  "Given a reference map (containing a :$ref key), return a path of
  keywords that may be used with (get-in) to get the referenced value in
  a schema."
  [s]
  (as-> s $
    (cstr/split $ #"/")
    (drop 1 $)
    (mapv s->kw $)))

;; lookup
;; -----------------------------------------------------------------------------
;; NB We memoize the lookup function to avoid repeating the work
;; of (possibly recursively) looking up the definition of a $ref. This
;; is done via alter-var-root, which atomically alters the root binding
;; of a var by applying a function and any arguments. The advantage is
;; that it leaves the original fn available for development and testing,
;; without needing to account for the complications in these areas that
;; arise from memoization.

(defn lookup
  "Given a schema and a reference map (containing a :$ref key), return the
  value being referred to by the reference string. References can refer
  to other references so it's necessary to recursively look them up."
  [$ref schema]
  {:pre [(string? $ref) (map? schema)]}
  (loop [components (get schema :components)
         ref-path (ref->path $ref)
         ref-val (get-in schema ref-path)]
    (if-not (contains? ref-val :$ref)
      ref-val
      (recur components ref-path ref-val))))

#?(:clj (alter-var-root #'lookup memoize)
   :cljs (set! lookup (memoize lookup)))
