(ns com.kubelt.ddt.cmds.ipfs.node
  "CLI setup for 'ipfs node' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.node.id :as node.id]))

(defonce command
  {:command "node <command>"
   :desc "Get info about an IPFS node"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js node.id/command))
                  (.demandCommand)))})
