(ns com.kubelt.ddt.cmds.sdk.resource.add
  "Invoke the 'sdk resource add' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "add"
   :desc "Add a resource"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (println "add: not yet implemented"))
                (sdk/halt! kbt)))})
