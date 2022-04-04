(ns com.kubelt.ddt.cmds.ipfs.key.rm
  "Invoke the 'ipfs key rm' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.key :as v0.key]))

(defonce command
  {:command "rm <name>"
   :desc "Remove keypair(s)"

   :builder (fn [^Yargs yargs]
              (let [config #js {:description "Display extra information"
                                :type "boolean"}]
                (.option yargs "verbose" config))
              (let [config #js {:description "Encoding used for keys"
                                :choices #js ["b58mh" "base32" "base36"]}]
                (.option yargs "ipns-base" config))
              yargs)

   :handler (fn [args]
              (let [args (js->clj args :keywordize-keys true)
                    ipns-base (get args :ipns-base)
                    verbose? (get args :verbose)
                    ;; TODO support multiple key names
                    key-name (get args :name)
                    params (cond-> {}
                             (not (nil? key-name))
                             (assoc :key/name key-name)
                             (not (nil? ipns-base))
                             (assoc :ipns/base ipns-base)
                             (not (nil? verbose?))
                             (assoc :verbose verbose?))
                    request (v0.key/rm params)
                    client (ipfs.client/init)
                    response-p (ipfs.client/request client request)]
                (-> response-p
                    (.then (fn [body]
                             (let [data (clj->js body)
                                   indent 2
                                   data-str (js/JSON.stringify data nil indent)]
                               (println data-str))))
                    (.catch (fn [error]
                              (println error))))
                ;; Returning a promise breaks things.
                args))})
