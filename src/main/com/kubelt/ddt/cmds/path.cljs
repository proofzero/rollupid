(ns com.kubelt.ddt.cmds.path
  "CLI setup for 'path' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.path.cache :as path.cache]
   [com.kubelt.ddt.cmds.path.config :as path.config]
   [com.kubelt.ddt.cmds.path.data :as path.data]
   [com.kubelt.ddt.cmds.path.log :as path.log]
   [com.kubelt.ddt.cmds.path.temp :as path.temp]))

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
