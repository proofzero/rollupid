(ns com.kubelt.ddt.cmds.p2p.authenticate
  "Invoke the p2p > authenticate method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["process" :as process])
  (:require
   [cljs.core.async :as async :refer [<!]]
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.base64 :as lib.base64]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as lib.p2p]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "auth <core>"
   :desc "Authenticate a user"

   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs))

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    {:keys [host port tls core]} args-map
                    app-name (get args-map :$0)
                    wallet-name (get args-map :wallet)
                    maddr (str "/ip4/" host "/tcp/" port)
                    scheme (if tls :https :http)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (async/go
                     (let [password (.-password result)
                           wallet (<! (lib.wallet/load app-name wallet-name password))
                           kbt (sdk/init {:crypto/wallet wallet
                                          :p2p/read maddr
                                          :p2p.read/scheme scheme
                                          :p2p/write maddr
                                          :p2p.write/scheme scheme})
                           result (<! (lib.p2p/authenticate! kbt core))]
                       (if (lib.error/error? result)
                         (prn (:error result))
                         (let [nonce (get result :nonce)
                               ;; The nonce is a hex-encoded integer,
                               ;; e.g. 0x123abc. When fed back into the
                               ;; verify command it is interpreted as a
                               ;; number rather than a string; avoid
                               ;; that by base-encoding it.
                               nonce-b64 (lib.base64/encode nonce)
                               output (cstr/join " = " ["nonce" nonce-b64])]
                           (println output)))
                       (sdk/halt! kbt)))))))})
