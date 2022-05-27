(ns com.kubelt.rpc.schema.expand
  "Expand an OpenRPC document to replace internal references to components
  by the referred value."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.zip :as zip])
  (:require
   [com.kubelt.rpc.schema.util :as rpc.schema.util]
   [com.kubelt.rpc.schema.zip :as rpc.schema.zip]))

;; replace-ref
;; -----------------------------------------------------------------------------
;; NB: must return a loc that is *just before* the next loc of
;; interest (in a depth-first traversal).

(defn- replace-ref
  "Replaces an OpenRPC reference by the corresponding definition. Expects
  a parsed OpenRPC schema as edn that contains the referenced
  definition, and a zipper loc pointing at a reference (a map containing
  a :$ref keyword whose value symbolically links to a definition
  supplied elsewhere in the document)."
  [loc schema]
  ;; zip/edit returns a new loc just after the value that is replaced.
  (zip/edit loc
            (fn [node schema]
              ;; We know that node is a {:$ref "..."} map, as this fn is
              ;; only invoked when (ref-loc?) returns true.
              (let [$ref (get node :$ref)
                    ;; Returns a map containing a JSON Schema definition for
                    ;; the type, or nil if definition lookup failed.
                    ref-def (rpc.schema.util/lookup $ref schema)]
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
  (loop [loc (rpc.schema.zip/schema-zip schema)]
    (if (zip/end? loc)
      (zip/root loc)
      (recur (zip/next (if (rpc.schema.zip/ref-loc? loc)
                         (replace-ref loc schema)
                         loc))))))
