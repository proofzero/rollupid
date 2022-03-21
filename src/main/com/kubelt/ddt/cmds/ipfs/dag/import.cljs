(ns com.kubelt.ddt.cmds.ipfs.dag.import
  "Invoke the 'ipfs dag import' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.dag :as v0.dag]))

(defonce command
  {:command "import <path>"
   :desc "Import the contents of a .car file."

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
