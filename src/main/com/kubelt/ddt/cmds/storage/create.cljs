(ns com.kubelt.ddt.cmds.storage.create
  "Invoke the SDK (init) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.storage :as lib.storage]))

(defonce command
  {:command "create"
   :desc "Initialize SDK storage"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (lib.storage/create app-name)))})
