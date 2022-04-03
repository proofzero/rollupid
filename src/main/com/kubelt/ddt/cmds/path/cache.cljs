(ns com.kubelt.ddt.cmds.path.cache
  "Invoke the path > cache method to return the system configuration
  path."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "cache"
   :desc "Print the cache path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [{app-name :$0}
                    (js->clj args :keywordize-keys true)]
                (println (path/cache app-name))))})
