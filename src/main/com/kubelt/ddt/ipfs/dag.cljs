(ns com.kubelt.ddt.ipfs.dag
  "CLI setup for 'ipfs dag' sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.ipfs.dag.get :as dag.get]
   [com.kubelt.ddt.ipfs.dag.export :as dag.export]
   [com.kubelt.ddt.ipfs.dag.import :as dag.import]
   [com.kubelt.ddt.ipfs.dag.put :as dag.put]
   [com.kubelt.ddt.ipfs.dag.resolve :as dag.resolve]
   [com.kubelt.ddt.ipfs.dag.stat :as dag.stat]))


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
