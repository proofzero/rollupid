(ns com.kubelt.ddt.cmds.wallet
  "CLI setup for 'wallet' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.wallet.init :as wallet.init]
   [com.kubelt.ddt.cmds.wallet.ls :as wallet.ls]
   [com.kubelt.ddt.cmds.wallet.rm :as wallet.rm]
   [com.kubelt.ddt.cmds.wallet.sign :as wallet.sign]))

(defonce command
  {:command "wallet <command>"
   :desc "Manage local wallet"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js wallet.init/command))
                  (.command (clj->js wallet.ls/command))
                  (.command (clj->js wallet.rm/command))
                  (.command (clj->js wallet.sign/command))
                  (.demandCommand)))})
