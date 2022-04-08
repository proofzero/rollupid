(ns dapp.utils
  (:require 
    [taoensso.timbre :as log]))

(defn classnames 
  "Selects and creates a set of html classes"
  [& classes]
  (clojure.string/join " " (remove nil? classes)))

(defn log-fn 
  "Helper function for logs"
  [& params]
  (fn [_]
    (log/info params)))

