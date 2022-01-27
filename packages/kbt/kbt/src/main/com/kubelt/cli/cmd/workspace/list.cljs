(ns com.kubelt.cli.cmd.workspace.list
  "Define the CLI 'workspace list' command. This command lists the
  available workspaces."
  {:author "Kubelt Inc." :copyright 2021 :license "UNLICENSED"}
  (:require
   ;; TODO require SDK
   ))


(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "list available workspaces"
   :handler (fn [args]
              ;; TODO call the SDK to list workspaces
              (println "not yet implemented: list workspaces"))})
