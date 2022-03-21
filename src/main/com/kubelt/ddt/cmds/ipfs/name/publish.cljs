(ns com.kubelt.ddt.cmds.ipfs.name.publish
  "Invoke the 'ipfs name publish' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.name :as v0.name]))

(defonce command
  {:command "publish <ipfs-path>"
   :desc "Publish an IPFS name"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
