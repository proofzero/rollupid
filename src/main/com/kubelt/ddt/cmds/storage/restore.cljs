(ns com.kubelt.ddt.cmds.storage.restore
  "Invoke the SDK (init) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.storage :as lib.storage]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "restore"
   :desc "Load SDK state"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              ;;(ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (-> (sdk/init {:app/name app-name})
                    (lib.promise/then
                     (fn [kbt]
                       (-> (sdk/restore& kbt)
                           (lib.promise/then
                            (fn [kbt]
                              ;; Returns an SDK instance with the previous state restored.
                              (println "restored:")
                              (prn kbt)))
                           (lib.promise/catch
                               (fn [e]
                                 (println (:error e)))))))
                    (lib.promise/catch
                        (fn [e]
                          (let [msg (:error e)]
                            (println "error:" msg)))))))})
