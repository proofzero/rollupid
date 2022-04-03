(ns com.kubelt.ddt.cmds.wallet.rm
  "Invoke the wallet (rm) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   ["process" :as process])
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "rm <name>"
   :desc "Remove a wallet"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    app-name (get args-map :$0)
                    wallet-name (get args-map :name)]
                ;; Check that the wallet to remove exists.
                (when-not (lib.wallet/has-wallet? app-name wallet-name)
                  (let [message (str "wallet '" wallet-name "' doesn't exist")]
                    (println (str "error: " message))
                    (.exit process 1)))
                ;; We only remove the wallet if the user can supply the
                ;; password that decrypts it.
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (let [password (.-password result)]
                     ;; Check that password is correct (can decrypt wallet).
                     (when-not (lib.wallet/can-decrypt? app-name wallet-name password)
                       (let [message (str "password for '" wallet-name "' is incorrect")]
                         (println (str "error: " message))
                         (.exit process 1)))
                     ;; Prompt the user to confirm that they want to
                     ;; remove the wallet.
                     (ddt.prompt/confirm-rm!
                      (fn [err rm?]
                        (ddt.util/exit-if err)
                        (when rm?
                          (lib.wallet/delete! app-name wallet-name)
                          (println "removed wallet" wallet-name)))))))))})
