(ns com.kubelt.ddt.cmds.rpc.oort
  "RPC oort options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.oort.config :as oort.config]
   [com.kubelt.ddt.cmds.rpc.oort.profile :as oort.profile]))

(defonce command
  {:command "oort <command>"
   :desc "Work with RPC oort APIs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js oort.config/command))
                  (.command (clj->js oort.profile/command))
                  (.demandCommand)))})
