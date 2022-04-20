(ns com.kubelt.ddt.cmds.path.temp
  "Invoke the path > temp method to return the system configuration path."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "temp"
   :desc "Print the temp path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [{app-name :$0}
                    (js->clj args :keywordize-keys true)]
                (println (path/temp app-name))))})
