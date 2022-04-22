(ns com.kubelt.ddt.cmds.sdk.core.logged-in
  "Invoke the 'sdk core logged-in' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "logged-in"
   :desc "Check if user is logged in"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  ;; TODO check if user has a stored JWT for a session.
                  (println "logged-in: not yet implemented"))
                (sdk/halt! kbt)))})
