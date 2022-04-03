(ns com.kubelt.ddt.cmds.p2p
  "CLI setup for 'p2p' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.p2p.authenticate :as p2p.authenticate]
   [com.kubelt.ddt.cmds.p2p.query :as p2p.query]
   [com.kubelt.ddt.cmds.p2p.store :as p2p.store]
   [com.kubelt.ddt.cmds.p2p.verify :as p2p.verify]))

(defonce command
  {:command "p2p <command>"
   :desc "Interact with p2p system"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js p2p.authenticate/command))
                  (.command (clj->js p2p.verify/command))
                  (.command (clj->js p2p.query/command))
                  (.command (clj->js p2p.store/command))
                  (.demandCommand)))})
