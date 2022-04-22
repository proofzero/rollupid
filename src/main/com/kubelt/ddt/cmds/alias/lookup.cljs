(ns com.kubelt.ddt.cmds.alias.lookup
  "Invoke the alias lookup method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.alias :as lib.alias]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "lookup <core> <aliasname>"
   :desc "Resolve a core's alias to another core's address"
   :requiresArg false

   :builder (fn [^Yargs yargs]
       (let [;; Enforce string type, otherwise yargs parses a
                    ;; wallet address starting with "0x" as a big
                    ;; integer.
                    core-addr #js {:describe "a @core name"
                                     :type "string"}]
                (.positional yargs "core" core-addr)
                yargs))

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
                _ (println "hereiam with arg map")
                _ (println args-map)
               {:keys [host port core aliasname]} args-map
               kbt (sdk/init )]
              (println "TODO lookup core alias")
              (-> (lib.alias/lookup! kbt core aliasname) 
                (.then (fn [lookup-result]
                  (println lookup-result)))
                (.catch (fn [e]    
                         {})))
              (println "hereiam finished")))})
