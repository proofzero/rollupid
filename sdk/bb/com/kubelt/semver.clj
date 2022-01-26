(ns com.kubelt.semver
  "Work with semantic versions."
  (:require
   [clojure.string :as str]))

(defn parse
  "Parse a semantic version string into a map."
  [s]
  (let [[major minor patch & rev] (str/split s #"\.|-")
        major (Integer/parseInt major)
        minor (Integer/parseInt minor)
        patch (Integer/parseInt patch)
        rev-map (if rev {:revision (str/join "" rev)} {})]
    (merge {:major major
            :minor minor
            :patch patch}
           rev-map)))

(defn major
  "Increment the major version."
  [{:keys [major] :as m}]
  (let [major-version (inc major)]
    (assoc m :major major-version)))

(defn minor
  "Increment the minor version."
  [{:keys [minor] :as m}]
  (let [minor-version (inc minor)]
    (assoc m :minor minor-version)))

(defn patch
  "Increment the patch version."
  [{:keys [patch] :as m}]
  (let [patch-version (inc patch)]
    (assoc m :patch patch-version)))

(defn revision
  "Set the release revision to the given string."
  [m revision]
  {:pre [(string? revision)]}
  (assoc m :revision revision))

(defn release-candidate
  [m rc-num]
  {:pre [(or (string? rc-num) (number? rc-num))]}
  (let [revision (str "rc" rc-num)]
    (assoc m :revision revision)))

(defn to-str
  [{:keys [major minor patch revision] :as m}]
  (let [prefix (str/join "." [major minor patch])]
    (if revision
      (str/join "-" [prefix revision])
      prefix)))
