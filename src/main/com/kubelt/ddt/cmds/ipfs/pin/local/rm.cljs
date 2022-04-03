(ns com.kubelt.ddt.cmds.ipfs.pin.local.rm
  "Invoke the 'ipfs pin local rm' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin :as v0.pin]))

(defonce command
  {:command "rm <ipfs-path>"
   :desc "Remove pinned object from local storage"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
