(ns com.kubelt.ddt.p2p.query
  "Invoke the p2p (query) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.core.async :as async :refer [<!]])
  (:require
   [cognitect.transit :as transit])
  (:require
   [com.kubelt.ddt.p2p.options :as cli.p2p]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as p2p]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "query <key>"
   :desc "Query a p2p namespace"

   :builder (fn [^Yargs yargs]
              (cli.p2p/options yargs)
              yargs)

   :handler (fn [args]
              (let [{:keys [key host port]} (js->clj args :keywordize-keys true)
                    maddr (str "/ip4/" host "/tcp/" port)
                    kbt (sdk/init {:p2p/read maddr :p2p/write maddr})]
                (if (lib.error/error? kbt)
                  (prn (:error kbt))
                  ;; TODO error handling (anomalies?)
                  (let [;; TODO supply account details from somewhere;
                        ;; should we have a local wallet for development /
                        ;; testing?
                        wallet {:com.kubelt/type :kubelt.type/wallet
                                :wallet/public-key "xyzabc123"
                                :wallet/sign-fn (fn [x] :fixme)}
                        result-chan (p2p/query! kbt wallet key)]
                    (async/go
                      (let [result (<! result-chan)]
                        ;; TODO use utility fn to detect error result
                        (if (lib.error/error? result)
                          (prn (:error result))
                          (println result))))))
                (sdk/halt! kbt)))})
