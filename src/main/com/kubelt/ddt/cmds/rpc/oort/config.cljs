(ns com.kubelt.ddt.cmds.rpc.oort.config
  "RPC oort options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.oort.config.get :as oort.config.get]
   [com.kubelt.ddt.cmds.rpc.oort.config.set :as oort.config.set]))

(defonce command
  {:command "config"
   :desc "Work with RPC core config APIs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js oort.config.get/command))
                  (.command (clj->js oort.config.set/command))
                  (.demandCommand)))})
