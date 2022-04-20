(ns com.kubelt.ddt.cmds.ipfs.key.rename
  "Invoke the 'ipfs dag put' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.key :as v0.key]))

(defonce command
  {:command "rename <old-name> <new-name>"
   :desc "Rename a keypair"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
