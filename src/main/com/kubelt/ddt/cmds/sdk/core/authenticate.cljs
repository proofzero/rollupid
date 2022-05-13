(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(defn authenticate [args-map password on-authenticate]
 (let [app-name (get args-map :app-name)
       wallet-name (get args-map :wallet)]
   (-> (lib.wallet/load app-name wallet-name password)
       (lib.promise/then
        (fn [wallet]
          (let [ ;; Transform command line arguments into an SDK options map.
                options (-> args-map
                            ddt.options/init-options
                            (assoc :crypto/wallet wallet))
                address (:wallet/address wallet)]
            (-> (sdk/init options)
                (lib.promise/then
                 (fn [kbt]
                   (-> (sdk.core/authenticate! kbt address)
                       (lib.promise/then
                        on-authenticate)
                       (lib.promise/catch
                           (fn [e]
                             (println (ex-message e))
                             (prn (ex-data e))))
                       (lib.promise/finally
                         (fn []
                           (sdk/halt! kbt)))))))))))))

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
                 (authenticate
                  (ddt.options/to-map args)
                  (.-password result)
                  (fn [result] (prn result))))))})
