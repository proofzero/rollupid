(ns com.kubelt.rpc.schema.expand
  "Expand an OpenRPC document to replace internal references to components
  by the referred value."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.rpc.schema.util :as rpc.schema.util]))


;; For example:
;; {:$ref "#/components/contentDescriptors/Transaction"}
;; => [:components :content-descriptors :transaction]
(defn ref->path
  "Given a reference map (containing a :$ref key), return a path of
  keywords that may be used with (get-in) to get the referenced value in
  a schema."
  [{s :$ref}]
  (as-> s $
    (cstr/split $ #"/")
    (drop 1 $)
    (map rpc.schema.util/s->kw $)
    (into [] $)))

;; lookup
;; -----------------------------------------------------------------------------

(defn lookup
  "Given a schema and a reference map (containing a :$ref key), return the
  value being referred to by the reference string. References can refer
  to other references so it's necessary to recursively look them up."
  [schema $ref]
  {:pre [(every? map? [schema $ref])]}
  (loop [components (get schema :components)
         ref-path (ref->path $ref)
         ref-val (get-in schema ref-path)]
    (if-not (contains? ref-val :$ref)
      ref-val
      (recur components ref-path ref-val))))

;; expand
;; -----------------------------------------------------------------------------

(defn expand
  "Return a version of the schema where all $ref links are replaced by the
  referred values."
  [schema]
  {:pre [(map? schema)]}
  ;; TODO
  schema)
