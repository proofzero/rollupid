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
  {:command "authenticate <core>"
   :desc "Authenticate an account"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              (let [;; Enforce string type, otherwise yargs parses a
                    ;; wallet address starting with "0x" as a big
                    ;; integer.
                    core-config #js {:describe "a @core name"
                                     :type "string"}]
                (.positional yargs "core" core-config)
                (ddt.options/options yargs))
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    {:keys [host port tls core]} args-map
                    app-name (get args-map :$0)
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
                                          :p2p.write/scheme scheme})]
                       (-> (sdk.core/authenticate! kbt core)
                           (.then (fn [result]
                                    (if (lib.error/error? result)
                                      (prn (:error kbt))
                                      ;; TODO encrypt(?) and store returned JWT
                                      (prn result))))
                           (.then (fn []
                                    (sdk/halt! kbt))))))))))})
