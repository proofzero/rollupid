(ns com.kubelt.lib.rdf.util
  "Shared RDF-related utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]))

;; Utilities
;; -----------------------------------------------------------------------------

(defn remove-blank-prefix
  "Remove a Turtle-derived prefix from a blank node name, if present."
  [s]
  {:pre [(string? s)]}
  (str/replace s #"^_:" ""))

(defn remove-var-prefix
  "Remove a RDF/js Variable name prefix, if present."
  [s]
  {:pre [(string? s)]}
  (str/replace s #"^\?" ""))
