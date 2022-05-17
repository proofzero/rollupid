(ns com.kubelt.ddt.cmds.wallet.sign
  "Sign data using the wallet."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
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
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (if err
                     (ddt.util/exit-if err)
                     (let [password (.-password result)]
                       (-> (lib.wallet/load& app-name wallet password)
                           (lib.promise/then
                            (fn [wallet]
                              (let [sign-fn (get wallet :wallet/sign-fn)
                                    decoded (lib.base64/decode-string data)]
                                (-> (sign-fn decoded)
                                    (.then (fn [signature]
                                             (println signature)))))))
                           (lib.promise/catch (fn [e] (ddt.util/exit-if e))))))))))})
