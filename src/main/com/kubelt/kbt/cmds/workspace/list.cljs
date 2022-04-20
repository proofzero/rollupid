(ns com.kubelt.kbt.cmds.workspace.list
  "Define the CLI 'workspace list' command. This command lists the
  available workspaces."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.sdk.v1 :as sdk.v1]))


(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "list available workspaces"
   :handler (fn [args]
              ;; TODO call the SDK to list workspaces
              (println "not yet implemented: list workspaces"))})
