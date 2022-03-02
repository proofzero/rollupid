(ns com.kubelt.ddt.sdk.account
  "CLI setup for 'account' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.sdk.account.authenticate :as account.authenticate]
   [com.kubelt.ddt.sdk.account.logged-in :as account.logged-in]
   [com.kubelt.ddt.sdk.account.register :as account.register]))

(defonce command
  {:command "account <command>"
   :desc "Work with Kubelt accounts"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js account.register/command))
                  (.command (clj->js account.authenticate/command))
                  (.command (clj->js account.logged-in/command))
                  (.demandCommand)))})
