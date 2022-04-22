(ns com.kubelt.ddt.cmds.sdk.workspace
  "CLI setup for 'workspace' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.sdk.workspace.available :as workspace.available]))

(defonce command
  {:command "workspace <command>"
   :desc "Work with Kubelt workspaces"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js workspace.available/command))
                  (.demandCommand)))})
