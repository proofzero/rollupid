(ns com.kubelt.ddt.cmds.rpc.oort.profile.set
  "RPC oort profile set options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call ]
   [com.kubelt.ddt.options :as ddt.options]))

(defonce command
  {:command "set <profile-value>"
   :desc "Make an RPC call to set profile value (by default in json)"
   :requiresArg true
   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config)
              (.option yargs rpc.call/edn-name rpc.call/edn-value))
   :handler (rpc.call/ddt-rpc-call ":kb:set:profile" [:profile-value])})
