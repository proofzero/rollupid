(ns com.kubelt.ddt.cmds.rpc.call
  "Make an RPC call."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.options :as ddt.options]))

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
                                :string true
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
                    method (get args-map :method)
                    params (get args-map :param)]
                ;;(prn args-map)
                ;;(prn params)
                (println "RPC call:" method)
                (doseq [[k v] params]
                  (println "->" (name k) ":" v))))})
