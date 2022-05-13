(ns com.kubelt.ddt.cmds.rpc.call
  "Make an RPC call."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [com.kubelt.ddt.cmds.sdk.core.authenticate :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.sdk.v1.core :as sdk.core]
   [taoensso.timbre :as log]))

(defonce command
  {:command "call <method>"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              ;; A generic --param option is used to collection RPC call
              ;; parameters.
              (let [config #js {:alias "x"
                                :describe "An RPC parameter (<name>=<value>)"
                                :requiresArg true
                                :demandOption "param name and value are required"
                                :array true
                                :nargs 1}]
                (.option yargs "param" config))
              ;; Return a parameter map rather than an array
              ;; of "<name>=<value>" strings.
              (let [param-fn
                    (fn [m s]
                      (let [[k v] (cstr/split s #"=")
                            kw (keyword k)]
                        (assoc m kw v)))]
                (.coerce yargs "param"
                         (fn [params]
                           (js->clj (reduce param-fn {} params))))))

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    method (->> (cstr/split (get args-map :method) #":")
                                (filter (complement cstr/blank?))
                                (mapv keyword))
                    params (get args-map :param)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (ddt.auth/authenticate
                    args-map
                    (.-password result)
                    (fn [sys]
                      (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                          (lib.promise/then (fn [api]
                                              (let [client (->> (update-in api [:methods 1 :result] assoc :name "pong" :schema {:type "string"})
                                                                (rpc/init "url"))
                                                    request (rpc/request* client method params)
                                                    rpc-method (:method/name (:rpc/method request))
                                                    rpc-params (:rpc/params request)]
                                                (-> (sdk.core/call-rpc-method sys (-> sys :crypto/wallet :wallet/address)
                                                                              rpc-method
                                                                              (into [] (vals rpc-params)))
                                                    (lib.promise/then (fn [r]
                                                                        (log/debug :rpc/call {:method rpc-method
                                                                                              :params rpc-params})
                                                                        (println "call result: " r)))))))
                          (lib.promise/catch (fn [e]
                                               (println (ex-message e))
                                               (prn (ex-data e)))))))))))})
