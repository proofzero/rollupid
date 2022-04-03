(ns com.kubelt.ddt.cmds.ipfs.node.id
  "Invoke the 'ipfs node id' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.node :as v0.node]))

(defonce command
  {:command "id <ipfs-path>"
   :desc "Show info about IPFS peers"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
