(ns com.kubelt.ddt.ipfs.key
  "CLI setup for 'ipfs key' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.ipfs.key.generate :as key.generate]
   [com.kubelt.ddt.ipfs.key.import :as key.import]
   [com.kubelt.ddt.ipfs.key.list :as key.list]
   [com.kubelt.ddt.ipfs.key.rename :as key.rename]
   [com.kubelt.ddt.ipfs.key.rm :as key.rm]))

(defonce command
  {:command "key <command>"
   :desc "Create and list IPNS name keypairs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js key.generate/command))
                  (.command (clj->js key.import/command))
                  (.command (clj->js key.list/command))
                  (.command (clj->js key.rename/command))
                  (.command (clj->js key.rm/command))
                  (.demandCommand)))})
