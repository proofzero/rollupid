(ns com.kubelt.ddt.ipfs.pin.remote
  "CLI setup for 'ipfs pin remote' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.ipfs.pin.remote.add :as remote.add]
   [com.kubelt.ddt.ipfs.pin.remote.ls :as remote.ls]
   [com.kubelt.ddt.ipfs.pin.remote.rm :as remote.rm]))

(defonce command
  {:command "remote <command>"
   :desc "Pin objects to remote storage"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js remote.add/command))
                  (.command (clj->js remote.ls/command))
                  (.command (clj->js remote.rm/command))
                  (.demandCommand)))})
