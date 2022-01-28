(ns com.kubelt.kbt.cmd.workspace
  "Sets up the CLI 'workspace' command group."
  {:copyright "ⓒ2022 Kubelt Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.kbt.cmd.workspace.list :as workspace.list]))


(defonce command
  {:command "workspace <command>"
   :alias ["ws"]
   :desc "Interact with your workspace(s)"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js workspace.list/command))
                  (.demandCommand)))})
