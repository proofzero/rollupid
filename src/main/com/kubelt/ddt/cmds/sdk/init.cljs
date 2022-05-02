(ns com.kubelt.ddt.cmds.sdk.init
  "Invoke the SDK (init) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "init"
   :desc "Initialize the SDK"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (-> (sdk/init)
                  (lib.promise/then
                   (fn [kbt]
                     (println "initializing the SDK")
                     (-> (sdk/halt! kbt)
                         (lib.promise/then
                          (fn []
                            (println "shutdown SDK"))))))
                  (lib.promise/catch
                      (fn [e]
                        (prn (:error e))))))})
