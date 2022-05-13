(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]))


(defonce command
  {:command "authenticate"
   :desc "Authenticate an account"
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
                  (fn [result] (prn result))))))})
