(ns com.kubelt.ddt.cmds.wallet.rm
  "Invoke the wallet (rm) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["process" :as process])
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "rm <name>"
   :desc "Remove a wallet"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)
                    wallet-name (get args-map :name)]
                (lib.promise/promise
                 (fn [resolve reject]
                   ;; Check that the wallet to remove exists.
                   (when-not (lib.wallet/has-wallet?& app-name wallet-name)
                     (let [message (str "error: wallet '" wallet-name "' doesn't exist")]
                       (reject message)))
                   ;; We only remove the wallet if the user can supply the
                   ;; password that decrypts it.
                   (ddt.prompt/ask-password!
                    (fn [err result]
                      (ddt.util/exit-if err)
                      (let [password (.-password result)]
                        ;; Check that password is correct (can decrypt wallet).
                        (-> (lib.wallet/can-decrypt?& app-name wallet-name password)
                            (lib.promise/then (fn [_]
                                                (ddt.prompt/confirm-rm!
                                                 (fn [err rm?]
                                                   (ddt.util/exit-if err)
                                                   (when rm?
                                                     (lib.wallet/delete! app-name wallet-name)
                                                     (println "removed wallet" wallet-name)
                                                     (resolve))))))
                            (lib.promise/catch (fn [e]
                                                 (let [message (str "password for '" wallet-name "' is incorrect")]
                                                   (println (str "error: " message))
                                                   (.exit process 1)))))

;; Prompt the user to confirm that they want to
                        ;; remove the wallet.
                        )))))))})
