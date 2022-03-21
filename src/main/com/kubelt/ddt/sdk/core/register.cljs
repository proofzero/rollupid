(ns com.kubelt.ddt.sdk.core.register
  "Invoke the 'sdk core register method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "init"
   :desc "Initialize the SDK"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (println "register: not yet implemented"))
                (sdk/halt! kbt)))})
