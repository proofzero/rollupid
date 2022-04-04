(ns com.kubelt.ddt.cmds.ipfs.pin.local.ls
  "Invoke the 'ipfs pin local ls' method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.client :as ipfs.client]
   [com.kubelt.ipfs.v0.pin :as v0.pin]))

(defonce command
  {:command "ls [<ipfs-path>]"
   :desc "List objects pinned to local storage"

   :builder (fn [^Yargs yargs]
              (let [path-config #js {:description "Path to objects to be listed"
                                     :type "string"}]
                (.option yargs "ipfs-path" path-config))
              (let [type-config #js {:description "Type of pinned keys to list"
                                     :choices #js ["direct" "indirect" "recursive" "all"]
                                     :type "string"}]
                (.option yargs "pin-type" type-config))
              (let [quiet-config #js {:description "Write just hashes of objects"
                                      :type "boolean"}]
                (.option yargs "quiet" quiet-config))
              (let [stream-config #js {:description "Enable streaming of pins"
                                       :type "boolean"}]
                (.option yargs "stream" stream-config))
              yargs)

   :handler (fn [args]
              (let [args (js->clj args :keywordize-keys true)
                    path (get args :ipfs-path)
                    pin-type (get args :pin-type)
                    quiet? (get args :quiet)
                    stream? (get args :stream)
                    params (cond-> {}
                             (not (nil? path))
                             (assoc :ipfs/path path)
                             (not (nil? pin-type))
                             (assoc :pin/type pin-type)
                             (not (nil? quiet?))
                             (assoc :quiet quiet?)
                             (not (nil? stream?))
                             (assoc :stream stream?))
                    request (v0.pin/ls params)
                    client (ipfs.client/init)
                    response-p (ipfs.client/request client request)]
                (-> response-p
                    (.then (fn [body]
                             ;; Convert edn to JSON and pretty print.
                             (let [data (clj->js body)
                                   indent 2
                                   data-str (js/JSON.stringify data nil indent)]
                               (println data-str))))
                    (.catch (fn [error]
                              (println error))))
                ;; Returning a promise breaks things.
                args))})
