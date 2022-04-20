(ns com.kubelt.ddt.cmds.sdk.options
  "Invoke the SDK (options) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "options"
   :desc "Print SDK options"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    options (ddt.options/init-options args-map)
                    kbt (sdk/init options)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (let [options (sdk/options kbt)]
                    (prn options)
                    (sdk/halt! kbt)))))})
