(ns com.kubelt.ddt.cmds.ipfs.name.resolve
  "Invoke the 'ipfs key import' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   ;;[com.kubelt.ipfs.client :as ipfs.client]
   ;;[com.kubelt.ipfs.v0.name :as v0.name]
   ))

(defonce command
  {:command "resolve [<name>]"
   :desc "Resolve IPNS names"

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [#_args]
              (println "not yet implemented"))})
