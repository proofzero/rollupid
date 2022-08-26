(ns com.kubelt.ddt.cmds.sdk.core.authenticate
  "Invoke the 'sdk core authenticate' method."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
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
              ;; permission
              (let [permission {;; NB: "p" is already used for "port" in common options.
                                :alias "x"
                                :describe "Permission to request"
                                :requiresArg true
                                :array true}]
                (.option yargs "permission" (clj->js permission)))
              ;; blockchain
              (let [blockchain {:describe "Blockchain name"
                                :requiresArg true
                                :demandOption "blockchain name is required"
                                :nargs 1
                                :choices ["ethereum"]
                                :default "ethereum"
                                :string true}]
                (.option yargs "blockchain" (clj->js blockchain)))
              ;; chain
              (let [chain {:describe "human-readable chain name"
                           :requiresArg true
                           :demandOption "chain name is required"
                           :nargs 1
                           :string true}]
                (.option yargs "chain" (clj->js chain)))
              ;; chain-id
              (let [chain-id {:describe "numerical chain identifier"
                              :requiresArg true
                              :demandOption "chain identifier is required"
                              :nargs 1
                              :number true}]
                (.option yargs "chain-id" (clj->js chain-id)))
              yargs)

   :handler (fn [args]
              (ddt.prompt/ask-password!
               (fn [err result]
                 (ddt.util/exit-if err)
                 (ddt.auth/authenticate
                  (ddt.options/to-map args)
                  (.-password result)
                  (fn [result] (prn result))))))})
