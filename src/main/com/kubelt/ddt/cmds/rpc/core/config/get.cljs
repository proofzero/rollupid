(ns com.kubelt.ddt.cmds.rpc.core.config.get
  "RPC core config get"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.core.config :as core.config]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call]))


(defonce command
  {:command "get"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config)
              (.option yargs core.config/json-path-name core.config/json-path-config))
   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    path  (get args-map (keyword core.config/json-path-name) "")
                    path* (ddt.util/rpc-name->path path)
                    handler (rpc.call/call-handler #(println (str "Selecting config-path (" path "): "(get-in % path*))))]
                (aset args "method" ":kb:get:config")
                (handler args)))})
