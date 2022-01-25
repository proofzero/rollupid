(ns com.kubelt.build
  "bb build utilities"
  (:require
   [cheshire.core :as json]
   [clojure.edn :as edn]
   [clojure.java.io :as io]
   [clojure.string :as str]))

(defn get-env
  "Return an environment variable value."
  [s]
  (System/getenv s))

(defn package-version
  "Extract and return the version attribute from a package.json file."
  [file-name]
  (let [pkg-reader (io/reader file-name)
        pkg-map (json/parse-stream pkg-reader)
        version (get pkg-map "version" "")]
    version))

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
