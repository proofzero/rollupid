(ns com.kubelt.cli.wallet.init
  "Invoke the wallet (init) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "init"
   :desc "Initialize local wallet"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (println "initializing local wallet")
                (sdk/halt! kbt)))})
