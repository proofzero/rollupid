(ns com.kubelt.ddt.ipfs
  "CLI setup for 'ipfs' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.ipfs.dag :as ipfs.dag]
   [com.kubelt.ddt.ipfs.key :as ipfs.key]
   [com.kubelt.ddt.ipfs.name :as ipfs.name]
   [com.kubelt.ddt.ipfs.node :as ipfs.node]
   [com.kubelt.ddt.ipfs.pin :as ipfs.pin]))

(defonce command
  {:command "ipfs <command>"
   :desc "Interact with IPFS"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js ipfs.dag/command))
                  (.command (clj->js ipfs.key/command))
                  (.command (clj->js ipfs.name/command))
                  (.command (clj->js ipfs.node/command))
                  (.command (clj->js ipfs.pin/command))
                  (.demandCommand)))})
