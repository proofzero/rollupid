(ns dapp.utils
  (:require
   ))

(defn classnames 
  [& classes]
  ["Selects and creates a set of html classes"]
  (clojure.string/join " " (remove nil? classes)))
