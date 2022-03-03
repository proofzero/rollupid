(ns com.kubelt.ddt.sdk.account.logged-in
  "Invoke the 'sdk account logged-in' method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
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
                  (println "logged-in: not yet implemented"))
                (sdk/halt! kbt)))})
