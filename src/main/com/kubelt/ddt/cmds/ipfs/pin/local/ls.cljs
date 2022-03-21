(ns com.kubelt.ddt.cmds.ipfs.pin.local.ls
  "Invoke the 'ipfs pin local ls' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin :as v0.pin]))

(defonce command
  {:command "ls [<ipfs-path>]"
   :desc "List objects pinned to local storage"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
