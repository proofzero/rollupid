(ns com.kubelt.kbt.cmd.workspace.list
  "Define the CLI 'workspace list' command. This command lists the
  available workspaces."
  {:copyright "ⓒ2022 Kubelt Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.v1 :as sdk.v1]))


(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "list available workspaces"
   :handler (fn [args]
              ;; TODO call the SDK to list workspaces
              (println "not yet implemented: list workspaces"))})
