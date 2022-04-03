(ns com.kubelt.ddt.cmds.ipfs.dag.stat
  "Invoke the 'ipfs dag stat' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.dag :as v0.dag]))

(defonce command
  {:command "stat <root>"
   :desc "Gets stats for a DAG."

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
