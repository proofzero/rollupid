(ns com.kubelt.ddt.p2p.store
  "Invoke the p2p (store) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :refer [<!]])
  (:require
   [com.kubelt.ddt.p2p.options :as cli.p2p]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as p2p]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "store <key> <value>"
   :desc "Store data in a p2p namespace"

   :builder (fn [^Yargs yargs]
              (cli.p2p/options yargs)
              yargs)

   :handler (fn [args]
              (let [{:keys [key value host port]} (js->clj args :keywordize-keys true)
                    maddr (str "/ip4/" host "/tcp/" port)
                    kbt (sdk/init {:p2p/read maddr :p2p/write maddr})]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  (let [;; TODO implement local wallet management for
                        ;; development / testing.
                        wallet {:com.kubelt/type :kubelt.type/wallet
                                :wallet/public-key "xyzabc123"
                                :wallet/sign-fn (fn [x] :fixme)}
                        res-chan (p2p/store! kbt wallet key value)]
                    (go
                      (let [result (<! res-chan)]
                        ;; TODO handle errors using common error utilities
                        ;; TODO use utility fn to detect error result
                        (if (lib.error/error? result)
                          (prn (:error result))
                          (println result)))
                      (sdk/halt! kbt))))))})
