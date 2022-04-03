(ns com.kubelt.ddt.cmds.ipfs.dag.resolve
  "Invoke the 'ipfs dag resolve' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.dag :as v0.dag]))

(defonce command
  {:command "resolve <ref>"
   :desc "Resolve IPLD block."

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "not yet implemented"))})
