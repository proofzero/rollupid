(ns com.kubelt.ddt.cmds.ipfs.dag.get
  "Invoke the 'ipfs dag get' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.dag :as v0.dag]))

(defonce command
  {:command "get <ref>"
   :desc "Get a DAG node from IPFS."

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
