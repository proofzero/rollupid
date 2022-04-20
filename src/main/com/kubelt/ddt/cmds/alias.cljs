(ns com.kubelt.ddt.cmds.alias
  "CLI setup for 'alias' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.alias.lookup :as alias.lookup]
   [com.kubelt.ddt.cmds.alias.add :as alias.add]))

(defonce command
  {:command "alias <command>"
   :desc "Work with core aliases"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js alias.lookup/command))
                  (.command (clj->js alias.add/command))
                  (.demandCommand)))})
