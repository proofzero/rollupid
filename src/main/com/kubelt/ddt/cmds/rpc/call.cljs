(ns com.kubelt.ddt.cmds.rpc.call
  "Make an RPC call."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.rpc :as rpc]
   [com.kubelt.rpc.schema :as rpc.schema]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(def ethers-rpc-name
  "ethers-rpc")

(def ethers-rpc-config
  #js {:describe "Use ethers lib to make rpc calls"
       :boolean true
       :alias "e"
       :default false})

(defn rpc-args [args]
  (let [args-map (ddt.options/to-map args)
        method (ddt.util/rpc-name->path (get args-map :method ""))
        params (get args-map :param {})
        rpc-client-type (get args-map (keyword ethers-rpc-name))]
    (assoc args-map
           :method method
           :params params
           :rpc-client-type rpc-client-type)))

(defn rpc-call& [sys api args]
  (lib.promise/promise
   (fn [resolve reject]
     (let [wallet-address (-> sys :crypto/wallet :wallet/address)
           client (-> {:uri/domain (-> sys :client/p2p :http/host)
                       :uri/port (-> sys :client/p2p :http/port)
                       :uri/path (cstr/join "" ["/@" wallet-address "/jsonrpc"])
                       :http/client (:client/http sys)
                       :rpc/jwt (get-in sys [:crypto/session :vault/tokens* wallet-address])}
                      rpc/init
                      (rpc.schema/schema api))
           request (rpc/prepare client (:method args) (or (:params args) {}))
           rpc-method (:method/name (:rpc/method request))
           rpc-params (:rpc/params request)]
       (if (:rpc-client-type args)
         (-> (sdk.core/call-rpc-method sys wallet-address rpc-method (into [] (vals rpc-params)))
             (lib.promise/then resolve)
             (lib.promise/catch reject))
         (-> (rpc/execute client request)
             (lib.promise/then #(resolve (-> % :http/body :result)))
             (lib.promise/catch reject)))))))

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
              (.option yargs ethers-rpc-name ethers-rpc-config)

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
              (let [args (rpc-args args)]
                (ddt.prompt/ask-password!
                 (fn [err result]
                   (ddt.util/exit-if err)
                   (ddt.auth/authenticate
                    args
                    (.-password result)
                    (fn [sys]
                      (-> (sdk.core/rpc-api sys (-> sys :crypto/wallet :wallet/address))
                          (lib.promise/then
                           (fn [api]
                             (-> (rpc-call& sys api args)
                                 (lib.promise/then #(println "-> " %))
                                 (lib.promise/catch #(println "ERROR-> " %)))))
                          (lib.promise/catch
                           (fn [e]
                             (println (ex-message e))
                             (prn (ex-data e)))))))))))})
