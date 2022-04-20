(ns com.kubelt.ddt.cmds.alias.lookup
  "Invoke the alias lookup method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

(defonce command
  {:command "lookup"
   :desc "Lookup a core's alias"
   :requiresArg true

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "TODO lookup core alias"))})
