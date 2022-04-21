(ns com.kubelt.ddt.cmds.alias.lookup
  "Invoke the alias lookup method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

(defonce command
  {:command "lookup <core> <alias-name>"
   :desc "Lookup a core's alias"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
               {:keys [host port core]} args-map]
              (println "TODO lookup core alias")))})
