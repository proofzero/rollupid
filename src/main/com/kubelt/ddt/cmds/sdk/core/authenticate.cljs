(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["path" :as path])
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
              (let [args-map (js->clj args :keywordize-keys true)
                    {:keys [host port tls]} args-map
                    base-name (.basename path (get args-map :$0))
                    app-name (cstr/join "." ["com" "kubelt" base-name])
                    wallet-name (get args-map :wallet)
                    maddr (str "/ip4/" host "/tcp/" port)
                    scheme (if tls :https :http)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (async/go
                     (let [password (.-password result)
                           wallet (<! (lib.wallet/load app-name wallet-name password))
                           kbt (sdk/init {:crypto/wallet wallet
                                          :p2p/read maddr
                                          :p2p.read/scheme scheme
                                          :p2p/write maddr
                                          :p2p.write/scheme scheme})
                           address (:wallet/address wallet)]
                       (-> (sdk.core/authenticate! kbt address)
                           (.then (fn [result]
                                    (prn result)))
                           (.catch (fn [e]
                                     (println (ex-message e))
                                     (prn (ex-data e))))
                           (.finally (fn []
                                       (sdk/halt! kbt))))))))))})
