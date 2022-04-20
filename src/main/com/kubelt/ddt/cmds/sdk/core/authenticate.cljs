(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
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

                         log-level (get args-map :log-level)
                         app-name (get args-map :app-name)
                         tls (get args-map :tls)
                         p2p-maddr (get args-map :p2p-maddr)
                         p2p-scheme (get args-map :p2p-scheme)
                         ipfs-read (get args-map :ipfs-read)
                         ipfs-write (get args-map :ipfs-write)
                         wallet-name (get args-map :wallet)
                         credentials (get args-map :credentials)

                         password (.-password result)
                         wallet (<! (lib.wallet/load app-name wallet-name password))

                         options {:crypto/wallet wallet
                                  :credential/jwt credentials
                                  :log/level log-level
                                  :ipfs/read ipfs-read
                                  :ipfs/write ipfs-write
                                  :p2p/read p2p-maddr
                                  :p2p.read/scheme p2p-scheme
                                  :p2p/write p2p-maddr
                                  :p2p.write/scheme p2p-scheme}

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
