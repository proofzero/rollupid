(ns com.kubelt.ddt.cmds.wallet.init
  "Invoke the wallet (init) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   ["process" :as process])
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "init <name>"
   :desc "Initialize local wallet"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    app-name (get args-map :$0)
                    wallet-name (get args-map :name)]
                ;; TODO check to see if wallet name is valid (using yargs)

                ;; Check to see if named wallet already exists. Wallets
                ;; can't be overwritten so throw an error if so.
                (if (lib.wallet/has-wallet? app-name wallet-name)
                  (let [message (str "wallet '" wallet-name "' already exists")]
                    (println (str "error: " message))
                    (.exit process 1)))
                (ddt.prompt/confirm-password!
                 (fn [err result]
                   (when err
                     (println (str "error: " err))
                     (.exit process 1))
                   (let [password (.-password result)]
                     (let [wallet-path (lib.wallet/init app-name wallet-name password)]
                       (println "initialized wallet:" wallet-name)))))))})
