(ns com.kubelt.ddt.cmds.wallet.ls
  "Invoke the wallet (ls) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["process" :as process])
  (:require
   [cljs.core.async :as async :refer [<!]]
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.color :as ddt.color]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "ls"
   :desc "List wallets"
   :requiresArg false

   :builder (fn [^Yargs yargs]
                (ddt.options/options yargs))

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)
                    {:keys [wallet]} args-map]
                (if (nil? wallet) 
                  (doseq [wallet-name (lib.wallet/ls app-name)]
                    (let [arrow (ddt.color/hilite "->")
                        wallet-line (cstr/join " " [arrow wallet-name])]
                    (println wallet-line)))
                  (let [wallet-name wallet]
                   (ddt.prompt/ask-password!
                    (fn [err result]
                   (ddt.util/exit-if err)
                   (async/go
                     (let [password (.-password result)
                           wallet-info (<! (lib.wallet/load app-name wallet password))
                           arrow (ddt.color/hilite "->")
                           wallet-line (cstr/join " " [arrow wallet-name wallet-info])]
                      (println wallet-line)))))))))})
