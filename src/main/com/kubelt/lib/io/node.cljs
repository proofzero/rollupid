(ns com.kubelt.lib.io.node
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]))

(defn write-to-file& [filename data]
  (.writeFile fs-promises filename data))
