(ns com.kubelt.ddt.cmds.ipfs.pin
  "CLI setup for 'ipfs pin' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.pin.local :as pin.local]
   [com.kubelt.ddt.cmds.ipfs.pin.remote :as pin.remote]
   [com.kubelt.ddt.cmds.ipfs.pin.service :as pin.service]))

(defonce command
  {:command "pin <command>"
   :desc "Pin objects"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js pin.local/command))
                  (.command (clj->js pin.remote/command))
                  (.command (clj->js pin.service/command))
                  (.demandCommand)))})
