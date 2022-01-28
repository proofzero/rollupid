(ns com.kubelt.cli.cmd.workspace
  "Sets up the CLI 'workspace' command group."
  {:author "Kubelt Inc." :copyright 2021 :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.cmd.workspace.list :as workspace.list]))


(defonce command
  {:command "workspace <command>"
   :alias ["ws"]
   :desc "Interact with your workspace(s)"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js workspace.list/command))
                  (.demandCommand)))})
