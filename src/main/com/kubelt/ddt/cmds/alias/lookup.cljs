(ns com.kubelt.ddt.cmds.alias.lookup
  "Invoke the alias lookup method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.alias :as lib.alias]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "lookup <core> <aliasname>"
   :desc "Resolve a core's alias to another core's address"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [args-map (js->clj args :keywordize-keys true)
               {:keys [host port core aliasname]} args-map
               kbt (sdk/init )]
              (println "TODO lookup core alias")
              (-> (lib.alias/lookup! kbt "0xdeadbeefdeadbeef" "testtest") 
                (.then (fn [lookup-result]
                  (println lookup-result)))
                (.catch (fn [e]    
                         {})))
              (println "hereiam finished")))})
