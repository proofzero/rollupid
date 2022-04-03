(ns com.kubelt.ddt.cmds.ipfs.key.rm
  "Invoke the 'ipfs key rm' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.key :as v0.key]))

(defonce command
  {:command "rm <name>"
   :desc "Remove a keypair"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
