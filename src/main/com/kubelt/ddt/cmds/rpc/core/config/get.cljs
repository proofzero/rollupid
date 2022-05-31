(ns com.kubelt.ddt.cmds.rpc.core.config.get
  "RPC core config get"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(defonce command
  {:command "get [path]"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config))
   :handler (fn [args]
              (aset args "method" ":kb:get:config")
              (let [args (rpc.call/rpc-args args)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (ddt.auth/authenticate
                    args
                    (.-password result)
                    (fn [sys]
                      (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                          (lib.promise/then
                           (fn [api]
                             (-> (rpc.call/rpc-call& sys api args)
                                 (lib.promise/then #(println "-> " %))
                                 (lib.promise/catch #(println "ERROR-> " %)))))
                          (lib.promise/catch
                           (fn [e]
                             (println (ex-message e))
                             (prn (ex-data e)))))))))))})
