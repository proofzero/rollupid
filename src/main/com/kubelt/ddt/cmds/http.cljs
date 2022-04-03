(ns com.kubelt.ddt.cmds.http
  "CLI setup for 'http' command group."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.http.request :as http.request]))

(defonce command
  {:command "http <command>"
   :desc "Make HTTP calls"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js http.request/command))
                  (.demandCommand)))})
