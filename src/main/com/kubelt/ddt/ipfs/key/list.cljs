(ns com.kubelt.ddt.ipfs.key.list
  "Invoke the 'ipfs key list' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.key :as v0.key]))

(defonce command
  {:command "list"
   :desc "List all local keypairs."

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
