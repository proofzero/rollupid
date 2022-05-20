(ns com.kubelt.ddt.cmds.rpc.ls
  "List available RPC methods."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.http.node :as http.node]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(defonce command
  {:command "list"
   :aliases ["ls"]
   :desc "List available RPC methods."
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (ddt.prompt/ask-password!
               (fn [err result]
                 (ddt.util/exit-if err)
                 (ddt.auth/authenticate
                  (ddt.options/to-map args)
                  (.-password result)
                  (fn [sys]
                    (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                        (lib.promise/then (fn [api]
                                            (let [client (-> {:uri/domain (-> sys :client/p2p :http/host)
                                                              :uri/port (-> sys :client/p2p :http/port)
                                                              :uri/path (cstr/join "" ["/@" (-> sys :crypto/wallet :wallet/address) "/jsonrpc"])
                                                              :http/client (:client/http sys)}
                                                             rpc/init
                                                             (rpc.schema/schema api))]
                                              (println (rpc/available client)))))
                        (lib.promise/catch
                         (fn [e]
                           (println (ex-message e))
                           (prn (ex-data e))))))))))})
