(ns com.kubelt.ddt.cmds.ipfs.pin.service.ls
  "Invoke the 'ipfs pin service ls' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin.remote.service :as v0.service]))

(defonce command
  {:command "ls"
   :desc "List remote pinning services"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
