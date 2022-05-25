(ns com.kubelt.ddt.cmds.rpc.core
  "RPC core options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.core.config :as core.config]))

(defonce command
  {:command "core <command>"
   :desc "Work with RPC core APIs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js core.config/command))
                  (.demandCommand)))})
