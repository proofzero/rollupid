(ns com.kubelt.ddt.sdk.account.authenticate
  "Invoke the 'sdk account authenticate' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "authenticate"
   :desc "Authenticate an account"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (println "authenticate: not yet implemented"))
                (sdk/halt! kbt)))})
