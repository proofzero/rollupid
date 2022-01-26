(ns com.kubelt.package
  "Utilities for working with package.json files."
  (:require
   [clojure.java.io :as io]
   [clojure.set :as cs])
  (:require
   [cheshire.core :as json]))

(defn read-file
  "Return a package.json file as a map."
  [file-name]
  (let [pkg-reader (io/reader file-name)]
    (json/parse-stream pkg-reader)))

(defn version
  "Extract and return the version attribute from a package.json file."
  [file-name]
  (let [pkg-map (read-file file-name)]
    (get pkg-map "version" "")))

(defn common-versions
  "Given paths to two package.json file, return a map of the common
  dependencies to the versions in each file."
  [a-file b-file]
  (let [map-a (read-file a-file)
        dep-a (get map-a "dependencies")
        set-a (set (keys dep-a))

        map-b (read-file b-file)
        dep-b (get map-b "dependencies")
        set-b (set (keys dep-b))

        in-both (cs/intersection set-a set-b)]
    (letfn [(reduce-fn [m dep-name]
              (let [a-version (get-in map-a ["dependencies" dep-name])
                    b-version (get-in map-b ["dependencies" dep-name])]
                (assoc m dep-name [a-version b-version])))]
      (reduce reduce-fn {} in-both))))

(defn mismatches
  "Return a map of dependencies common to the two given package.json files
  where the versions don't match."
  [a-file b-file]
  (let [versions (common-versions a-file b-file)
        match? (fn [m k [a b]]
                 (if (not= a b)
                   (assoc m k [a b])
                   m))]
    (reduce-kv match? {} versions)))
