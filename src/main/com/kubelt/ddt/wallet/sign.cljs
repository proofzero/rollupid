(ns com.kubelt.ddt.wallet.sign
  "Sign data using the wallet."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["process" :as process])
  (:require
   [cljs.core.async :as async :refer [<!]]
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.base64 :as lib.base64]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "sign <wallet> <data>"
   :desc "Sign some base64-encoded data"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                    {:keys [wallet data]} args-map
                    app-name (get args-map :$0)]
                ;; Check to see if named wallet exists.
                (if-not (lib.wallet/has-wallet? app-name wallet)
                  (let [message (str "wallet '" wallet "' doesn't exist")]
                    (ddt.util/exit-if message)))
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (async/go
                     (let [password (.-password result)
                           wallet (<! (lib.wallet/load app-name wallet password))
                           sign-fn (get wallet :wallet/sign-fn)
                           decoded (lib.base64/decode-string data)
                           signature (sign-fn decoded)]
                       (println signature)))))))})
