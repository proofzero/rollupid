(ns com.kubelt.ddt.cmds.json
  "CLI setup for 'json' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.cmds.json.convert :as json.convert]))


(defonce command
  {:command "json <command>"
   :desc "Invoke JSON methods"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js json.convert/command))
                  (.demandCommand)))})
