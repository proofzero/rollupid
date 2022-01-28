(ns com.kubelt.ddt.path
  "CLI setup for 'path' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.path.cache :as path.cache]
   [com.kubelt.ddt.path.config :as path.config]
   [com.kubelt.ddt.path.data :as path.data]
   [com.kubelt.ddt.path.log :as path.log]
   [com.kubelt.ddt.path.temp :as path.temp]))

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
