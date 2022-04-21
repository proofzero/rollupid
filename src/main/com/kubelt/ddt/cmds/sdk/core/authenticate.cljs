(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [cljs.core.async :as async :refer [<!]]
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(defonce command
  {:command "authenticate"
   :desc "Authenticate an account"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (ddt.prompt/ask-password!
               (fn [err result]
                 (ddt.util/exit-if err)
                 (async/go
                   (let [args-map (ddt.options/to-map args)
                         ;; Load the wallet.
                         app-name (get args-map :app-name)
                         wallet-name (get args-map :wallet)
                         password (.-password result)
                         wallet (<! (lib.wallet/load app-name wallet-name password))
                         ;; Transform command line arguments into an SDK options map.
                         options (-> args-map
                                     ddt.options/init-options
                                     (assoc :crypto/wallet wallet))
                         kbt (sdk/init options)
                         address (:wallet/address wallet)]
                     (-> (sdk.core/authenticate! kbt address)
                         (.then (fn [result]
                                  (prn result)))
                         (.catch (fn [e]
                                   (println (ex-message e))
                                   (prn (ex-data e))))
                         (.finally (fn []
                                     (sdk/halt! kbt)))))))))})
