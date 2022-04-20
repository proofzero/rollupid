(ns com.kubelt.ddt.cmds.ipfs.dag
  "CLI setup for 'ipfs dag' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.ipfs.dag.get :as dag.get]
   [com.kubelt.ddt.cmds.ipfs.dag.export :as dag.export]
   [com.kubelt.ddt.cmds.ipfs.dag.import :as dag.import]
   [com.kubelt.ddt.cmds.ipfs.dag.put :as dag.put]
   [com.kubelt.ddt.cmds.ipfs.dag.resolve :as dag.resolve]
   [com.kubelt.ddt.cmds.ipfs.dag.stat :as dag.stat]))


(defonce command
  {:command "dag <command>"
   :desc "Interact with IPFS DAG API"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js dag.export/command))
                  (.command (clj->js dag.get/command))
                  (.command (clj->js dag.import/command))
                  (.command (clj->js dag.put/command))
                  (.command (clj->js dag.resolve/command))
                  (.command (clj->js dag.stat/command))
                  (.demandCommand)))})
