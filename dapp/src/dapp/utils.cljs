(ns dapp.utils)

(defn classnames 
  "Selects and creates a set of html classes"
  [& classes]
  (clojure.string/join " " (remove nil? classes)))

(defn log-fn 
  "Helper function for logs"
  [& params]
  (fn [_]
    (prn params)))

