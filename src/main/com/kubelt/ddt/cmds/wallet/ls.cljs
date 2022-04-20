(ns com.kubelt.ddt.cmds.wallet.ls
  "Invoke the wallet (ls) method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["process" :as process])
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.color :as ddt.color]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "ls"
   :desc "List wallets"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    app-name (get args-map :$0)]
                (doseq [wallet-name (lib.wallet/ls app-name)]
                  (let [arrow (ddt.color/hilite "->")
                        wallet-line (cstr/join " " [arrow wallet-name])]
                    (println wallet-line)))))})
