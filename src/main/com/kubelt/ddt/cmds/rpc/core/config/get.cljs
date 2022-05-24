(ns com.kubelt.ddt.cmds.rpc.core.config.get
  "RPC core config get"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call]))


(defonce command
  {:command "get [path]"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config))
   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    path  (get args-map :path "")
                    path* (ddt.util/rpc-name->path path)
                    handler (rpc.call/call-handler #(println (str "Selecting config-path (" path "): " (get-in % path*))))]
                (aset args "method" ":kb:get:config")
                (handler args)))})
