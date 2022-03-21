(ns com.kubelt.ddt.cmds.sdk.resource
  "CLI setup for 'resource' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.cmds.sdk.resource.add :as resource.add]))

(defonce command
  {:command "resource <command>"
   :desc "Work with Kubelt resources"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js resource.add/command))
                  (.demandCommand)))})
