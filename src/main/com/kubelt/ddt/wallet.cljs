(ns com.kubelt.ddt.wallet
  "CLI setup for 'wallet' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.wallet.init :as wallet.init]
   [com.kubelt.ddt.wallet.ls :as wallet.ls]
   [com.kubelt.ddt.wallet.rm :as wallet.rm]
   [com.kubelt.ddt.wallet.sign :as wallet.sign]))

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
