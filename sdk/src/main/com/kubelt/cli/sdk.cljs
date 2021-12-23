(ns com.kubelt.cli.sdk
  "CLI setup for 'sdk' sub-command."
  {:copyright "©2021 Kubelt, Inc."}
  (:require
   [com.kubelt.cli.sdk.init :as sdk.init]))

(defonce command
  {:command "sdk <command>"
   :desc "Invoke SDK methods"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js sdk.init/command))
                  (.demandCommand)))})
