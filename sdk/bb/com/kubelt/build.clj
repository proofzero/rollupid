(ns com.kubelt.build
  "bb build utilities"
  (:require
   [cheshire.core :as json]
   [clojure.edn :as edn]
   [clojure.java.io :as io]
   [clojure.set :as cs]
   [clojure.string :as str]
   [clojure.tools.cli :as cli]))

(defn get-env
  "Return an environment variable value."
  [s]
  (System/getenv s))

(defn package-read
  "Return a package.json file as a map."
  [file-name]
  (let [pkg-reader (io/reader file-name)]
    (json/parse-stream pkg-reader)))

(defn package-version
  "Extract and return the version attribute from a package.json file."
  [file-name]
  (let [pkg-map (package-read file-name)]
    (get pkg-map "version" "")))

(defn package-common-versions
  "Given paths to two package.json file, return a map of the common
  dependencies to the versions in each file."
  [a-file b-file]
  (let [map-a (package-read a-file)
        dep-a (get map-a "dependencies")
        set-a (set (keys dep-a))

        map-b (package-read b-file)
        dep-b (get map-b "dependencies")
        set-b (set (keys dep-b))

        in-both (cs/intersection set-a set-b)]
    (letfn [(reduce-fn [m dep-name]
              (let [a-version (get-in map-a ["dependencies" dep-name])
                    b-version (get-in map-b ["dependencies" dep-name])]
                (assoc m dep-name [a-version b-version])))]
      (reduce reduce-fn {} in-both))))

(defn package-mismatches
  "Return a map of dependencies common to the two given package.json files
  where the versions don't match."
  [a-file b-file]
  (let [versions (package-common-versions a-file b-file)
        match? (fn [m k [a b]]
                 (if (not= a b)
                   (assoc m k [a b])
                   m))]
    (reduce-kv match? {} versions)))

(defn shadow->lein
  "Convert a shadow-cljs.edn file into a Leiningen project.clj file. This
  is primarily useful when using Leiningen to publish a ClojureScript
  library."
  [project-map shadow-path]
  (letfn [(wrap [s]
            (str "\"" s "\""))
          (read-shadow [path]
            (let [shadow-reader (java.io.PushbackReader. (io/reader shadow-path))]
              (edn/read shadow-reader)))
          (make-project [m]
            (let [n-str (name (:name m))
                  ns-str (namespace (:name m))
                  name-str (str/join "/" [ns-str n-str])
                  coords (str "defproject " name-str " " (wrap (:version m)))
                  description (str/join " " [:description (wrap (:description m))])
                  url (str/join " " [:url (wrap (:url m))])
                  source-paths (str/join " " [:source-paths (:source-paths m)])
                  dependencies (str/join " " [:dependencies (:dependencies m)])
                  repositories (str/join " " [:deploy-repositories (:repositories m)])
                  content (str/join " " [coords
                                         description
                                         url
                                         source-paths
                                         dependencies
                                         repositories])]
              (str "(" content ")")))]
    (let [;; Extract dependencies from shadow-cljs.edn
          shadow-map (read-shadow shadow-path)
          deps-vec (get shadow-map :dependencies [])
          ;; Combine the extracted dependencies with a "provided"
          ;; ClojureScript entry.
          cljs-vec [['org.clojure/clojurescript "1.10.914" :scope "provided"]]
          dependencies (into [] (concat cljs-vec deps-vec))
          ;; Store the updated dependencies in the project map.
          project-map (assoc project-map :dependencies dependencies)]
      (make-project project-map))))

;; TODO: put CLI in it's own namespace
(def cli-options
  [["-r" "--release-candidate Git hash" "Git hash"
    :default nil]
   ["-h" "--help"]])

(defn parse-options [args] (:options (cli/parse-opts args cli-options)))

(defn use-version 
  "Generate a release candidate or release version"
  [version opts]
  (if-let [rc (get opts :release-candidate)]
          (str version "-rc-" rc)
          version))

(defn release-version 
  [package-file, cli-opts-args] 
  (use-version (package-version package-file) (parse-options cli-opts-args)))

