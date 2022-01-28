(ns com.kubelt.ddt.http
  "CLI setup for 'http' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.http.request :as http.request]))

(defonce command
  {:command "http <command>"
   :desc "Make HTTP calls"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js http.request/command))
                  (.demandCommand)))})
