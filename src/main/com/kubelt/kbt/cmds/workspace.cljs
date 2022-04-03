(ns com.kubelt.kbt.cmds.workspace
  "Sets up the CLI 'workspace' command group."
  {:copyright "ⓒ2022 Kubelt Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.kbt.cmds.workspace.list :as workspace.list]))


(defonce command
  {:command "workspace <command>"
   :alias ["ws"]
   :desc "Interact with your workspace(s)"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js workspace.list/command))
                  (.demandCommand)))})
