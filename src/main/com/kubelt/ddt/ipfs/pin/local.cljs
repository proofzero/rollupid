(ns com.kubelt.ddt.ipfs.pin.local
  "CLI setup for 'ipfs pin local' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.ipfs.pin.local.add :as local.add]
   [com.kubelt.ddt.ipfs.pin.local.ls :as local.ls]
   [com.kubelt.ddt.ipfs.pin.local.rm :as local.rm]
   [com.kubelt.ddt.ipfs.pin.local.update :as local.update]
   [com.kubelt.ddt.ipfs.pin.local.verify :as local.verify]))

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
