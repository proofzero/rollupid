(ns com.kubelt.ddt.cmds.rpc.ls
  "List available RPC methods."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "List available RPC methods."
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (ddt.prompt/ask-password!
               (fn [err result]
                 (ddt.util/exit-if err)
                 (ddt.auth/authenticate
                  (ddt.options/to-map args)
                  (.-password result)
                  (fn [sys]
                    (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                        (lib.promise/then
                         (fn [api]
                           (println (->> (update-in api [:methods 1 :result] assoc :name "pong" :schema {:type "string"})
                                         (rpc/init)
                                         (rpc/available)))))
                        (lib.promise/catch
                            (fn [e]
                              (println (ex-message e))
                              (prn (ex-data e))))))))))})
