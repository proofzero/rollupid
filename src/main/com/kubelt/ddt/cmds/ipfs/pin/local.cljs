(ns com.kubelt.ddt.cmds.ipfs.pin.local
  "CLI setup for 'ipfs pin local' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.pin.local.add :as local.add]
   [com.kubelt.ddt.cmds.ipfs.pin.local.ls :as local.ls]
   [com.kubelt.ddt.cmds.ipfs.pin.local.rm :as local.rm]
   [com.kubelt.ddt.cmds.ipfs.pin.local.update :as local.update]
   [com.kubelt.ddt.cmds.ipfs.pin.local.verify :as local.verify]))

(defonce command
  {:command "local <command>"
   :desc "Pin objects to local storage"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js local.add/command))
                  (.command (clj->js local.ls/command))
                  (.command (clj->js local.rm/command))
                  (.command (clj->js local.update/command))
                  (.command (clj->js local.verify/command))
                  (.demandCommand)))})
