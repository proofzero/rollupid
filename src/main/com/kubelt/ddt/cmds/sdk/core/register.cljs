(ns com.kubelt.ddt.cmds.sdk.core.register
  "Invoke the 'sdk core register method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "register"
   :desc "Register with a core"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (println "register: not yet implemented"))
                (sdk/halt! kbt)))})
