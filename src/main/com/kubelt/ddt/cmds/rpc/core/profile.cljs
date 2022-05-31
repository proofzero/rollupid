(ns com.kubelt.ddt.cmds.rpc.core.profile
  "RPC core options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.core.profile.get :as core.profile.get]))

(defonce command
  {:command "profile"
   :desc "Work with RPC core profile APIs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js core.profile.get/command))
                  (.demandCommand)))})
