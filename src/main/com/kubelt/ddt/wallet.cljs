(ns com.kubelt.ddt.wallet
  "CLI setup for 'wallet' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.wallet.init :as wallet.init]))

(defonce command
  {:command "wallet <command>"
   :desc "Manage local wallet"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js wallet.init/command))
                  (.demandCommand)))})
