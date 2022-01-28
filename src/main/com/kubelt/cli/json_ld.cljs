(ns com.kubelt.cli.json-ld
  "CLI setup for 'json-ld' sub-command."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.json-ld.parse :as json-ld.parse]))

(defonce command
  {:command "json-ld <command>"
   :desc "Work with JSON-LD data"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js json-ld.parse/command))
                  (.demandCommand)))})
