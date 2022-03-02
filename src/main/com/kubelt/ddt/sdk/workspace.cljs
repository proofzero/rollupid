(ns com.kubelt.ddt.sdk.workspace
  "CLI setup for 'workspace' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.sdk.workspace.available :as workspace.available]))

(defonce command
  {:command "workspace <command>"
   :desc "Work with Kubelt workspaces"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js workspace.available/command))
                  (.demandCommand)))})
