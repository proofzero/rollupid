(ns com.kubelt.ddt.cmds.rpc.call
  "Make an RPC call."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]
   [cljs.reader :as r])
  (:require
   [com.kubelt.ddt.auth :as ddt.auth]
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.ddt.prompt :as ddt.prompt]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.ddt.util :as ddt.util]
   [com.kubelt.lib.rpc :as lib.rpc]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(def edn-name
  "edn-format")

(def edn-value
  #js {:describe "read value as edn"
       :boolean false
       :alias "f"
       :default false})

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
                             (-> (lib.rpc/rpc-call& sys api args)
                                 (lib.promise/then #(println "-> " %))
                                 (lib.promise/catch #(println "ERROR-> " %)))))
                          (lib.promise/catch
                           (fn [e]
                             (println (ex-message e))
                             (prn (ex-data e)))))))))))})

(defn ddt-rpc-call
  ([method]
   (ddt-rpc-call method nil))
  ([method params]
   (fn [args*]
     (aset args* "method" method)
     (let [args (rpc-args args*)
           edn? (get args (keyword edn-name))
           args (reduce (fn [c p]
                          (assoc-in c [:params] (let [data (p c (if edn? "nil"  "null"))]
                                                  (if edn?
                                                    (r/read-string data)
                                                    (lib.json/json-str->edn data)))))
                        args
                        params)]
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
                    (-> (lib.rpc/rpc-call& sys api args)
                        (lib.promise/then #(println "-> " %))
                        (lib.promise/catch #(println "ERROR-> " %)))))
                 (lib.promise/catch
                  (fn [e]
                    (println (ex-message e))
                    (prn (ex-data e)))))))))))))
