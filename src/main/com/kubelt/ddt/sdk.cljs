(ns com.kubelt.ddt.sdk
  "CLI setup for 'sdk' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.sdk.init :as sdk.init]))

(defonce command
  {:command "sdk <command>"
   :desc "Invoke SDK methods"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js sdk.init/command))
                  (.demandCommand)))})
