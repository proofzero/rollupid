(ns com.kubelt.ddt.cmds.path.cache
  "Invoke the path > cache method to return the system configuration
  path."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "cache"
   :desc "Print the cache path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (println (path/cache app-name))))})
