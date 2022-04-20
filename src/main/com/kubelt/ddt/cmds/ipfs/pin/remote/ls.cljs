(ns com.kubelt.ddt.cmds.ipfs.pin.remote.ls
  "Invoke the 'ipfs pin remote ls' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin.remote :as v0.pin.remote]))

(defonce command
  {:command "ls"
   :desc "List objects pinned to remote storage"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
