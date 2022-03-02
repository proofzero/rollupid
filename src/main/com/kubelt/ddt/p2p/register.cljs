(ns com.kubelt.ddt.p2p.register
  "Invoke the p2p (register) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ddt.p2p.options :as cli.p2p]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as lib.p2p]
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
                    wallet {:com.kubelt/type :kubelt.type/wallet
                            :wallet/public-key "xyzabc123"
                            :wallet/sign-fn (fn [x] :fixme)}
                    result (lib.p2p/register! kbt wallet)]
                (if (lib.error/error? result)
                  (prn (:error result))
                  (println result))
                (sdk/halt! kbt)))})
