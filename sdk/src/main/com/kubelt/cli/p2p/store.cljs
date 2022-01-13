(ns com.kubelt.cli.p2p.store
  "Invoke the p2p (store) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.cli.p2p.options :as cli.p2p]
   [com.kubelt.sdk.impl.p2p :as p2p]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "store <key> <value>"
   :desc "Store data in a p2p namespace"

   :builder (fn [^Yargs yargs]
              (cli.p2p/options yargs)
              yargs)

   :handler (fn [args]
              (let [{:keys [key value host port]} (js->clj args :keywordize-keys true)
                    ;; TODO auto-detect the platform
                    kbt (sdk/init {:sys/platform :platform/node
                                   :p2p/host host
                                   :p2p/port port})
                    ;; TODO implement local wallet management for
                    ;; development / testing.
                    account {:kubelt/type :kubelt.type/account
                             :account/public-key "xyzabc123"}]
                ;; TODO handle errors
                (p2p/store! kbt account key value)
                (sdk/halt! kbt)))})
