(ns com.kubelt.ddt.cmds.wallet.init
  "Invoke the wallet (init) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "init <name>"
   :desc "Initialize local wallet"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)
                    ;; TODO check to see if wallet name is valid (using yargs)
                    wallet-name (get args-map :name)]
                ;; Check to see if named wallet already exists. Wallets
                ;; can't be overwritten so throw an error if so.
                (if (lib.wallet/has-wallet? app-name wallet-name)
                  (let [message (str "wallet '" wallet-name "' already exists")]
                    (ddt.util/exit-if message)))
                (ddt.prompt/confirm-password!
                 (fn [err result]
                   (when err
                     (ddt.util/exit-if err))
                   (let [password (.-password result)]
                     (let [wallet (lib.wallet/init app-name wallet-name password)
                           wallet-name (get wallet :wallet/name)
                           ;; NB: Also available are the mnemonic path, locale.
                           mnemonic (get wallet :wallet.mnemonic/phrase)]
                       (println "initialized wallet:" wallet-name)
                       (println "-> mnemonic:" mnemonic)))))))})
