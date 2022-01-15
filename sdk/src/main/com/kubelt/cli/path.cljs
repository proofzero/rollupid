(ns com.kubelt.cli.path
  "CLI setup for 'path' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.path.cache :as path.cache]
   [com.kubelt.cli.path.config :as path.config]
   [com.kubelt.cli.path.data :as path.data]
   [com.kubelt.cli.path.log :as path.log]
   [com.kubelt.cli.path.temp :as path.temp]))

(defonce command
  {:command "path <command>"
   :desc "Discover system paths"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js path.cache/command))
                  (.command (clj->js path.config/command))
                  (.command (clj->js path.data/command))
                  (.command (clj->js path.log/command))
                  (.command (clj->js path.temp/command))
                  (.demandCommand)))})
