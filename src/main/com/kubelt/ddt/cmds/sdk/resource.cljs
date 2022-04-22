(ns com.kubelt.ddt.cmds.sdk.resource
  "CLI setup for 'resource' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.sdk.resource.add :as resource.add]))

(defonce command
  {:command "resource <command>"
   :desc "Work with Kubelt resources"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js resource.add/command))
                  (.demandCommand)))})
