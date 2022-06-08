(ns com.kubelt.deps
  "Generate a deps.edn file based on a shadow-cljs.edn file."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [babashka.fs :as fs]
   [clojure.edn :as edn]
   [clojure.java.io :as io])
  (:require
   [com.kubelt.common :as common]))


(defn- read-edn
  "Return the parsed contents of the edn file at path."
  [path]
  (let [shadow-reader (java.io.PushbackReader. (io/reader path))]
    (edn/read shadow-reader)))

;; make-deps
;; -----------------------------------------------------------------------------

(defn make-deps
  "Generate a deps.edn file based on a shadow-cljs.edn file."
  [root-path pkg-path version]
  (letfn [(to-deps-edn [[k v]]
            [k {:mvn/version v}])]
    (let [shadow-path (str (fs/path root-path common/shadow-file))
          output-path (str (fs/path pkg-path common/deps-file))
          ;; Extract dependencies from shadow-cljs.edn
          shadow-map (read-edn shadow-path)
          deps-vec (get shadow-map :dependencies [])
          deps-map (into {} (map to-deps-edn deps-vec))
          ;; Build a deps.edn file
          deps-edn {:paths ["src/main"]
                    :dependencies deps-map}]
      (spit output-path (pr-str deps-edn)))))
