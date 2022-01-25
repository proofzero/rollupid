(ns com.kubelt.build
  "bb build utilities"
  (:require
   [cheshire.core :as json]
   [clojure.java.io :as io]))

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
