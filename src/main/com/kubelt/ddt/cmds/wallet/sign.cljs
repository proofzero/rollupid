(ns com.kubelt.ddt.cmds.wallet.sign
  "Sign data using the wallet."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
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
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet :as lib.wallet]))

(defonce command
  {:command "sign <data>"
   :desc "Sign some base64-encoded data"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; Include common options.
              (ddt.options/options yargs)
              yargs)

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    app-name (get args-map :app-name)
                    wallet (get args-map :wallet)
                    data (get args-map :data)]
                (lib.promise/promise
                 (fn [resolve reject]
                   ;; Check to see if named wallet exists.
                   (if-not (lib.wallet/has-wallet? app-name wallet)
                     (let [message (str "error: wallet '" wallet "' doesn't exist")]
                       (reject message))
                     ;; The named wallet exists so load it and extract
                     ;; the signing function to use on the supplied
                     ;; data.
                     (ddt.prompt/ask-password!
                      (fn [err result]
                        (if err
                          (reject err)
                          (let [password (.-password result)]
                            (-> (lib.wallet/load app-name wallet password)
                                (lib.promise/then
                                 (fn [wallet]
                                   (let [sign-fn (get wallet :wallet/sign-fn)
                                         decoded (lib.base64/decode-string data)]
                                     (-> (sign-fn decoded)
                                         (.then (fn [signature]
                                                  (println signature)
                                                  (resolve)))))))))))))))))})
