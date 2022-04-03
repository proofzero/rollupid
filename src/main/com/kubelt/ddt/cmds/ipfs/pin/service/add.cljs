(ns com.kubelt.ddt.cmds.ipfs.pin.service.add
  "Invoke the 'ipfs pin service add' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin.remote.service :as v0.service]))

(defonce command
  {:command "add <service>"
   :desc "Add remote pinning service"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
