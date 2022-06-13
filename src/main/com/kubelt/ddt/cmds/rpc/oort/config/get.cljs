(ns com.kubelt.ddt.cmds.rpc.oort.config.get
  "RPC oort config get"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call]
   [com.kubelt.ddt.options :as ddt.options]))

(defonce command
  {:command "get [path]"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config))
   :handler (rpc.call/ddt-rpc-call ":kb:get:config")})
