(ns dapp.utils
  (:require 
    [taoensso.timbre :as log]))

(defn classnames 
  "Selects and creates a set of html classes"
  [& classes]
  (clojure.string/join " " (remove nil? classes)))

