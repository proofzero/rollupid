(ns com.kubelt.ddt.cmds.rpc.oort.profile
  "RPC oort options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.oort.profile.get :as oort.profile.get]
   [com.kubelt.ddt.cmds.rpc.oort.profile.set :as oort.profile.set]))

(defonce command
  {:command "profile"
   :desc "Work with RPC oort profile APIs"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js oort.profile.get/command))
                  (.command (clj->js oort.profile.set/command))
                  (.demandCommand)))})
