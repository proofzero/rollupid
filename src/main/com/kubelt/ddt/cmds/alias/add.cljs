(ns com.kubelt.ddt.cmds.alias.add
  "Invoke the alias add method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

(defonce command
  {:command "add"
   :desc "Add an alias to a core"
   :requiresArg true

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "TODO Add an alias to a core"))})
