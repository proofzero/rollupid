(ns com.kubelt.ddt.cmds.wallet.import
  "Invoke the wallet (import) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
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
                (ddt.prompt/ask-mnemonic!
                 (fn [err result]
                   (let [mnemonic (.-mnemonic result)]
                     (ddt.prompt/confirm-password!
                      (fn [err result]
                        (when err
                          (ddt.util/exit-if err))
                        (let [password (.-password result)
                              result& (lib.wallet/import& app-name wallet-name mnemonic password)]
                          (-> result&
                              (lib.promise/then
                               (fn [{:keys [wallet/name]}]
                                 (let [message (str "wallet '" name "' successfully imported")]
                                   (println message))))
                              (lib.promise/catch
                                  (fn [error]
                                    (let [message (:error error)]
                                      (println message)))))))))))))})
