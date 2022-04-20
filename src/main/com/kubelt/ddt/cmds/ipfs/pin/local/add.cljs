(ns com.kubelt.ddt.cmds.ipfs.pin.local.add
  "Invoke the 'ipfs pin local add' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin :as v0.pin]))

(defonce command
  {:command "add <ipfs-path>"
   :desc "Pin objects to local storage"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
