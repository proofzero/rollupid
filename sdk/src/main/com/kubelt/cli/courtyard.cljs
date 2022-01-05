(ns com.kubelt.cli.courtyard
  "CLI setup for 'sdk' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.courtyard.convert :as courtyard.convert]))


(defonce command
  {:command "courtyard <command>"
   :desc "Invoke Courtyard methods"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js courtyard.convert/command))
                  (.demandCommand)))})
