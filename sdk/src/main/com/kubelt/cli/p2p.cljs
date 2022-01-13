(ns com.kubelt.cli.p2p
  "CLI setup for 'p2p' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.p2p.query :as p2p.query]
   [com.kubelt.cli.p2p.register :as p2p.register]
   [com.kubelt.cli.p2p.store :as p2p.store]))

(defonce command
  {:command "p2p <command>"
   :desc "Interact with p2p system"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js p2p.query/command))
                  (.command (clj->js p2p.register/command))
                  (.command (clj->js p2p.store/command))
                  (.demandCommand)))})
