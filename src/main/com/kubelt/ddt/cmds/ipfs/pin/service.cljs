(ns com.kubelt.ddt.cmds.ipfs.pin.service
  "CLI setup for 'ipfs pin service' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.pin.service.add :as service.add]
   [com.kubelt.ddt.cmds.ipfs.pin.service.ls :as service.ls]
   [com.kubelt.ddt.cmds.ipfs.pin.service.rm :as service.rm]))

(defonce command
  {:command "service <command>"
   :desc "Configure remote pinning services"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js service.add/command))
                  (.command (clj->js service.ls/command))
                  (.command (clj->js service.rm/command))
                  (.demandCommand)))})
