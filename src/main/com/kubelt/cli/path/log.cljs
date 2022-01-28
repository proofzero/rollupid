(ns com.kubelt.cli.path.log
  "Invoke the path > log method to return the system configuration path."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.impl.path :as path]))

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
