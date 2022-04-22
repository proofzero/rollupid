(ns com.kubelt.ddt.cmds.ipfs.name
  "CLI setup for 'ipfs key' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.name.publish :as name.publish]
   [com.kubelt.ddt.cmds.ipfs.name.resolve :as name.resolve]))

(defonce command
  {:command "name <command>"
   :desc "Create and list IPNS name keypairs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js name.publish/command))
                  (.command (clj->js name.resolve/command))
                  (.demandCommand)))})
