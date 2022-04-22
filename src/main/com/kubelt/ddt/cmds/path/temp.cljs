(ns com.kubelt.ddt.cmds.path.temp
  "Invoke the path > temp method to return the system configuration path."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.path :as path]))

(defonce command
  {:command "temp"
   :desc "Print the temp path"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (println (path/temp app-name))))})
