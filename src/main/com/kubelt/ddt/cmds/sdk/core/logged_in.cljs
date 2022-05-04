(ns com.kubelt.ddt.cmds.sdk.core.logged-in
  "Invoke the 'sdk core logged-in' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "logged-in"
   :desc "Check if user is logged in"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (-> (sdk/init)
                  (lib.promise/then
                   (fn [kbt]
                     ;; TODO check if user has a stored JWT for a session.
                     (-> (sdk/halt! kbt)
                         (lib.promise/then
                          (fn []
                            (println "logged-in: not yet implemented"))))))
                  (lib.promise/catch
                      (fn [e]
                        (prn (:error e))))))})
