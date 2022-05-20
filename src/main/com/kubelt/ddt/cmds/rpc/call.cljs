(ns com.kubelt.ddt.cmds.rpc.call
  "Make an RPC call."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.sdk.v1.core :as sdk.core]
   [taoensso.timbre :as log]))

(defonce command
  {:command "call <method>"
   :desc "Make an RPC call."
   :requiresArg true
   :builder (fn [^Yargs yargs]
              ;; Include the common options.
              (ddt.options/options yargs)
              ;; A generic --param option is used to collect RPC call
              ;; parameters.
              (let [config #js {:alias "x"
                                :describe "An RPC parameter (<name>=<value>)"
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

   ;; RPC calls are represented as keyword vectors,
   ;; e.g. [:foo :bar]. For convenience on the command line, we ask the
   ;; user to provide this value as a colon-separated string,
   ;; e.g. :foo:bar.

   :handler (fn [args]
              (let [args-map (ddt.options/to-map args)
                    method (-> args-map :method ddt.util/rpc-name->path)
                    params (get args-map :param {})]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (ddt.auth/authenticate
                    args-map
                    (.-password result)
                    (fn [sys]
                      (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                          (lib.promise/then (fn [api]
                                              (let [client (-> {:uri/domain (-> sys :client/p2p :http/host)
                                                                :uri/port (-> sys :client/p2p :http/port)
                                                                :uri/path (cstr/join "" ["/@" (-> sys :crypto/wallet :wallet/address) "/jsonrpc"])
                                                                :http/client (:client/http sys)}
                                                               rpc/init
                                                               (rpc.schema/schema api))
                                                    _ (println params)
                                                    request (rpc/prepare client method (or params {}))
                                                    rpc-method (:method/name (:rpc/method request))
                                                    rpc-params (:rpc/params request)]
                                                (comment
                                                  "using ethers impl"
                                                  (-> (sdk.core/call-rpc-method sys (-> sys :crypto/wallet :wallet/address)
                                                                                rpc-method
                                                                                (into [] (vals rpc-params)))
                                                      (lib.promise/then
                                                       (fn [r]
                                                         (log/debug :rpc/call {:method rpc-method
                                                                               :params rpc-params})
                                                         (println "call result: " r)))))
                                                ;; using rpc-client impl
                                                (-> (rpc/execute client request)
                                                    (lib.promise/then (fn [r]
                                                                        (println "Response: " (-> r :http/body :result))))
                                                    (lib.promise/catch (fn [e]
                                                                         (println "e" e)))))))
                          (lib.promise/catch
                           (fn [e]
                             (println (ex-message e))
                             (prn (ex-data e)))))))))))})
