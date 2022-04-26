(ns com.kubelt.ddt.cmds.alias.add
  "Invoke the alias add method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.error :as lib.error]
  [com.kubelt.lib.alias :as lib.alias]
  [com.kubelt.sdk.v1 :as sdk]
  [taoensso.timbre :as log]))

(defonce command
  {:command "add <core> <aliasname> <targetaddress>"
   :desc "Add an alias to a core"
   :requiresArg true

   :builder (fn [^Yargs yargs]
     (let [;; Enforce string type, otherwise yargs parses a
      ;; wallet address starting with "0x" as a big
      ;; integer.
      core-arg-config #js {:describe "a @core name"
      :type "string"}]
      (.positional yargs "core" core-arg-config)
      (ddt.options/options yargs)
      yargs))

   :handler (fn [args] 
       (let [args-map (js->clj args :keywordize-keys true)
      {:keys [host port core aliasname targetaddress]} args-map
      kbt (sdk/init )]
      ;;TODO set log level from env arg
      ;;(log/set-level! :trace)
      (log/debug {:log/msg "add-alias begin"})
      (-> (lib.alias/add-alias! kbt core aliasname targetaddress)
       (.then (fn [add-result]
               (log/debug {:log/msg "add alias complete" :result add-result})
               (println add-result)))
       (.catch (fn [e]    
                {})))

      (log/debug {:log/msg "add-alias end"})))})
