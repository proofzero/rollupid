(ns com.kubelt.ddt.cmds.rpc.core.config.set
  "RPC core options"
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [cljs.reader :as r]
 ;;  [com.kubelt.ddt.cmds.rpc.core.config :as core.config]
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.cmds.rpc.call :as rpc.call ]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.sdk.v1.core :as sdk.core]
   [taoensso.timbre :as log]))


(def edn-name
  "edn-format")

(def edn-config
  #js {:describe "read config-value as edn"
       :boolean false
       :alias "f"
       :default false})


(defonce command
  {:command "set <path> [config-value]"
   :desc "Make an RPC call to set config value (by default in json) specifyng a path"
   :requiresArg true
   :builder (fn [^Yargs yargs]
              (ddt.options/options yargs)
              (.option yargs rpc.call/ethers-rpc-name rpc.call/ethers-rpc-config)
              (.option yargs edn-name edn-config))
   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    path  (get args-map :path "")
                    edn? (get args-map (keyword edn-name))
                    config-value  (let [data (get args-map :config-value (if edn? "nil"  "null"))]
                                    (if edn?
                                      (r/read-string data)
                                      (lib.json/json-str->edn data)))
                    path* (ddt.util/rpc-name->path path)
                    handler (rpc.call/call-handler #(println (str "Selecting config-path (" path "): " (assoc-in % path* config-value) " >>>" config-value)))]
                (aset args "method" ":kb:get:config")
                (handler args)))})
