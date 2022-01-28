(ns com.kubelt.cli
  (:require
   [clojure.tools.cli :as cli]
   [clojure.string :as str])
  (:require
   [com.kubelt.package :as package]
   [com.kubelt.semver :as semver]))

;; Global options for all commands.
(def cli-options
  [["-r" "--release-candidate <num>" "release candidate number"
    :parse-fn #(Integer/parseInt %)
    :validate [#(< 0 % 0x10000)]]
   ["-v" "--revision <str>" "revision string, e.g. git hash"]
   ["-h" "--help"]])

(defn has-conflicting-args?
  [options option-a option-b]
  (let [arg-map (select-keys options [option-a option-b])
        arg-cnt (count arg-map)]
    (> arg-cnt 1)))

(defn validate-args
  "Validate the arguments. Throws an error if an issue is detected."
  [{:keys [options] :as m}]
  (when (has-conflicting-args? options :release-candidate :revision)
    (throw (ex-info "conflicting options" {:options [:release-candidate :revision]}))))

(defn parse-options
  "Parse the provided command line options returning a map."
  [args]
  (let [options (cli/parse-opts args cli-options)]
    (when (:errors options)
      (throw (ex-info "unable to parse options" (:errors options))))
    (validate-args options)
    (:options options)))

(defn use-version
  "Generate a version string. If the options map has a :release-candidate
  key, the corresponding number value is appended to the version as
  -rcN. If the options map has a :revision key, the corresponding value
  is appended to the version string as-is."
  [version opts]
  (if (str/blank? version)
    version
    (let [version-map
          (cond
            (contains? opts :release-candidate)
            (let [rc (get opts :release-candidate)]
              (-> version semver/parse (semver/release-candidate rc)))

            (contains? opts :revision)
            (let [rev (get opts :revision)]
              (-> version semver/parse (semver/revision rev)))

            :else (semver/parse version))]
      (semver/to-str version-map))))

(defn release-version
  "Extract version"
  [package-file cli-opts-args]
  (use-version (package/version package-file)
               (parse-options cli-opts-args)))
