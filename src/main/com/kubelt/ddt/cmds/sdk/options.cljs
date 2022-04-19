(ns com.kubelt.ddt.cmds.sdk.options
  "Invoke the SDK (options) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "options"
   :desc "Print SDK options"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (let [options (sdk/options kbt)]
                    (prn options)
                    (sdk/halt! kbt)))))})
