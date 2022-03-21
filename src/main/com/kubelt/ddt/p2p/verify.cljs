(ns com.kubelt.ddt.p2p.verify
  "Invoke the p2p > verify method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["process" :as process])
  (:require
   [cljs.core.async :as async :refer [<!]])
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.base64 :as lib.base64]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as lib.p2p]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "verify <core> <nonce>"
   :desc "Verify a signed nonce"

   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs))

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    {:keys [host port tls core nonce]} args-map
                    app-name (get args-map :$0)
                    wallet-name (get args-map :wallet)
                    maddr (str "/ip4/" host "/tcp/" port)
                    scheme (if tls :https :http)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (when err
                     (println err)
                     (.exit process 1))
                   (async/go
                     (let [password (.-password result)
                           wallet (<! (lib.wallet/load app-name wallet-name password))
                           kbt (sdk/init {:crypto/wallet wallet
                                          :p2p/read maddr
                                          :p2p.read/scheme scheme
                                          :p2p/write maddr
                                          :p2p.write/scheme scheme})
                           ;; We base64-encode the nonce when spitting
                           ;; it out from authenticate to avoid
                           ;; confusion when reading it back. As a
                           ;; hex-encoded integer the CLI framework
                           ;; tries to parse it for us, which we prefer
                           ;; to avoid.
                           nonce (lib.base64/decode-string nonce)
                           sign-fn (get wallet :wallet/sign-fn)
                           signature (sign-fn nonce)
                           result-chan (lib.p2p/verify! kbt core nonce signature)]
                       (let [result (<! result-chan)]
                         (if (lib.error/error? result)
                           (prn (:error result))
                           (prn result)))
                       (sdk/halt! kbt)))))))})
