(ns com.kubelt.ddt.p2p.register
  "Invoke the p2p (register) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.p2p.options :as cli.p2p]
   [com.kubelt.lib.p2p :as p2p]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "register"
   :desc "Register a p2p namespace"

   :builder (fn [^Yargs yargs]
              (cli.p2p/options yargs)
              yargs)

   :handler (fn [args]
              ;; TODO pass in URI of p2p service; need to update the
              ;; config map spec to include details of p2p service
              (let [{:keys [host port]} (js->clj args :keywordize-keys true)
                    maddr (str "/ip4/" host "/tcp/" port)
                    kbt (sdk/init {:p2p/read maddr :p2p/write maddr})
                    ;; TODO local wallet management for dev / testing
                    account {:kubelt/type :kubelt.type/account
                             :account/public-key "xyzabc123"}]
                ;; TODO handle errors
                (p2p/register! kbt account)
                (sdk/halt! kbt)))})
