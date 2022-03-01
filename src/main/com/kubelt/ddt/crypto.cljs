(ns com.kubelt.ddt.crypto
  "CLI setup for 'crypto' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require))

(defonce command
  {:command "crypto <command>"
   :desc "Crypto-related utilities"
   :builder (fn [^js yargs]
              (-> yargs
                  (.demandCommand)))})
