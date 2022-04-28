(ns com.kubelt.ddt.cmds.wallet.import
  "Invoke the wallet (import) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "import <name>"
   :desc "Import wallet providing a name, mnemonic phrase and password"
   :requiresArg false
   :builder (fn [^Yargs yargs]
              yargs)
   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)
                    wallet-name (get args-map :name)]
                ;; TODO check to see if wallet name is valid (using yargs)

                ;; Check to see if named wallet already exists. Wallets
                ;; can't be overwritten so throw an error if so.
                (when (lib.wallet/has-wallet? app-name wallet-name)
                  (let [message (str "wallet '" wallet-name "' already exists")]
                    (ddt.util/exit-if message)))
                (ddt.prompt/ask-mnemonic!
                 (fn [err result]
                   (let [mnemonic (.-mnemonic result)]
                     (ddt.prompt/confirm-password!
                      (fn [err result]
                        (when err
                          (ddt.util/exit-if err))
                        (let [password (.-password result)]
                          (lib.wallet/import (fn [res]
                                               (println "successfully imported wallet:" res))
                                             app-name wallet-name mnemonic password)))))))))})
