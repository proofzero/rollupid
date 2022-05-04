(ns com.kubelt.ddt.cmds.sdk.options
  "Invoke the SDK (options) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :as lib.promise]
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
              (let [;; Convert command line arguments to a Clojure map.
                    args-map (ddt.options/to-map args)
                    ;; Transform command line arguments into an SDK options map.
                    options (ddt.options/init-options args-map)]
                (-> (sdk/init options)
                    (lib.promise/then
                     (fn [kbt]
                       (-> (sdk/options kbt)
                           (lib.promise/then
                            (fn [options]
                              (prn options)
                              (sdk/halt! kbt))))))
                    (lib.promise/catch
                        (fn [e]
                          (prn (:error e)))))))})
