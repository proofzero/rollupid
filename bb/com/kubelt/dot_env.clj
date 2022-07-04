(ns com.kubelt.dot-env
  "Work with .env files."
  (:require
   [clojure.java.io :as io]
   [clojure.string :as cstr]))

;; parse
;; -----------------------------------------------------------------------------

(defn parse
  "Parses a .env file into a map."
  [path]
  (let [lines (cstr/split-lines (slurp path))
        ;; True when a string is a line of comment text.
        comment? (fn [s] (-> s cstr/trim (cstr/starts-with? "#")))
        ;; True for "empty" lines (comments, empty lines, etc.)
        whitespace? (fn [s] (or (comment? s) (cstr/blank? s)))
        ;; Keep only lines containing KEY=VALUE pairs.
        lines (remove whitespace? lines)
        split-on (re-pattern "=")
        update-key (fn [[k v]]
                     (let [under (re-pattern "_")
                           under->dash (fn [s] (cstr/replace s under "-"))
                           new-k (-> k cstr/lower-case under->dash keyword)]
                       [new-k v]))]
    (into {} (map (fn [s] (-> s cstr/trim (cstr/split split-on) update-key)) lines))))

;; write
;; -----------------------------------------------------------------------------

(defn write
  "Write a map of values to the path as collection of environment variable
  definitions. Supported options:
  - :output/sort? [default: false], sort the output lines when true"
  [path env & {:keys [output/sort?] :or {output/sort? false}}]
  {:pre [(string? path) (map? env)]}
  (let [lines (reduce (fn [a [k v]]
                        (let [dash (re-pattern "-")
                              env-var (-> k name cstr/upper-case (cstr/replace dash "_"))
                              line (cstr/join "=" [env-var v])]
                          (conj a line))) [] env)
        lines (if sort? (sort lines) lines)
        content (cstr/join \newline lines)]
    (spit path content)))
