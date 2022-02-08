(ns com.kubelt.ddt.ipfs.pin.service.rm
  "Invoke the 'ipfs pin service rm' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin.remote.service :as v0.service]))

(defonce command
  {:command "rm <service>"
   :desc "Remove remote pinning service"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
