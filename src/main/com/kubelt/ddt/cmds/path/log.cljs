(ns com.kubelt.ddt.cmds.path.log
  "Invoke the path > log method to return the system configuration path."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "log"
   :desc "Print the log path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [{app-name :$0}
                    (js->clj args :keywordize-keys true)]
                (println (path/log app-name))))})
