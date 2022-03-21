(ns com.kubelt.ddt.cmds.path.config
  "Invoke the path > config method to return the system configuration
  path."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "config"
   :desc "Print the config path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [{app-name :$0}
                    (js->clj args :keywordize-keys true)]
                (println (path/config app-name))))})
