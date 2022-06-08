(ns com.kubelt.lein
  "Generate a Leiningen project.clj file based on a shadow-cljs.edn file."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [babashka.fs :as fs])
  (:require
   [com.kubelt.common :as common]
   [com.kubelt.shadow :as shadow]
   [com.kubelt.version :as version]))


;; A Leiningen project map to serve as the base on which we add
;; more data, e.g. dependencies.
(def ^:private base-map
  {:name :com.kubelt/sdk
   :description "Kubelt SDK"
   ;; The project's license. :distribution should be :repo or :manual;
   ;; :repo means it is OK for public repositories to host this project's
   ;; artifacts.
   :license {:name "Apache 2.0"
             :url "https://www.apache.org/licenses/LICENSE-2.0"
             :distribution :repo}
   :url "https://kubelt.com/"
   :source-paths ["src/main"]
   :repositories
   [["clojars" {:url "https://repo.clojars.org"
                :signing {:gpg-key common/signing-key}}]
    ["github" {:url "https://maven.pkg.github.com/kubelt/kubelt"
               :signing {:gpg-key common/signing-key}}]]
   :dependencies
   '[;; always use "provided" for Clojure(Script)
     [org.clojure/clojure version/clojure :scope "provided"]
     [org.clojure/clojurescript version/clojurescript :scope "provided"]
     [thheller/shadow-cljs version/shadow-cljs :scope "provided"]]})

;; make-project
;; -----------------------------------------------------------------------------

(defn make-project
  [root-path out-path version]
  (let [project-map (merge base-map {:version version})
        shadow-path (str (fs/path root-path common/shadow-file))
        output-path (str (fs/path out-path common/project-file))
        ;; The Leiningen project.clj file as a string.
        project-clj (shadow/shadow->lein project-map shadow-path)]
    (spit output-path project-clj)))
