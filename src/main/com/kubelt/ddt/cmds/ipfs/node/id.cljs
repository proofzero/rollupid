(ns com.kubelt.ddt.cmds.ipfs.node.id
  "Invoke the 'ipfs node id' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.node :as v0.node]))

(defonce command
  {:command "id"
   :desc "Show IPFS node id info"

   :builder (fn [^Yargs yargs]
              ;; TODO shared arguments for IPFS host, port, scheme, validate? keywordize?
              (let [path-config #js {:description "IPFS node path"
                                     :type "string"}]
                (.option yargs "ipfs-path" path-config))
              (let [format-config #js {:description "Output format"
                                       :type "string"}]
                (.option yargs "output-format" format-config))
              (let [base-config #js {:description "Encoding used for peer IDs"}]
                (.option yargs "peer-id-base" base-config))
              yargs)

   :handler (fn [args]
              (let [args (js->clj args :keywordize-keys true)
                    peer-id (get args :ipfs-path)
                    output-format (get args :output-format)
                    peer-base (get args :id-base)
                    params (cond-> {}
                             (not (nil? peer-id))
                             (assoc :peer/id peer-id)
                             (not (nil? output-format))
                             (assoc :output/format output-format)
                             (not (nil? peer-base))
                             (assoc :peer/id-base peer-base))
                    request (v0.node/id params)
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
