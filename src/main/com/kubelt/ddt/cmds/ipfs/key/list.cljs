(ns com.kubelt.ddt.cmds.ipfs.key.list
  "Invoke the 'ipfs key list' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.key :as v0.key]))

(defonce command
  {:command "list"
   :desc "List all local keypairs."

   :builder (fn [^Yargs yargs]
              (let [config #js {:description "Encoding used for keys"
                                :choices #js ["b58mh" "base32" "base36"]}]
                (.option yargs "ipns-base" config))
              (let [config #js {:description "Show extra information"
                                :type "boolean"}]
                (.option yargs "verbose" config))
              yargs)

   :handler (fn [args]
              (let [args (js->clj args :keywordize-keys true)
                    ipns-base (get args :ipns-base)
                    verbose? (get args :verbose)
                    params (cond-> {}
                             (not (nil? ipns-base))
                             (assoc :ipns/base ipns-base)
                             (not (nil? verbose?))
                             (assoc :verbose verbose?))
                    request (v0.key/list params)
                    client (ipfs.client/init)
                    response-p (ipfs.client/request client request)]
                (-> response-p
                    (.then (fn [body]
                             ;; Convert result from edn to JSON and pretty print.
                             (let [data (clj->js body)
                                   indent 2
                                   data-str (js/JSON.stringify data nil indent)]
                               (println data-str))))
                    (.catch (fn [error]
                              (println error))))
                ;; Returning a promise breaks things.
                args))})
