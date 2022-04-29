(ns com.kubelt.ddt.cmds.rpc.ls
  "List available RPC methods."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]))

(defonce command
  {:command "list "
   :aliases ["ls"]
   :desc "List available RPC methods."
   :requiresArg true
   :builder (fn [yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)]
                (println "RPC calls: fixme")))})
