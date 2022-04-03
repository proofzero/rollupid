(ns com.kubelt.ipfs.v0.name
  "Methods for working with IPNS names."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [resolve])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/name/publish
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Name": "<string>",
;;   "Value": "<string>"
;; }

(def publish-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Publish IPNS names."
   :resource/methods [:post]
   :resource/path "/name/publish"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "IPFS path of the object to be published."
     :required true
     :spec ipfs.spec/ipfs-path}
    :resolve
    {:name "resolve"
     :description "Check if the given path can be resolved before publishing. Default: true."
     :required false
     :spec :boolean}
    :lifetime
    {:name "lifetime"
     :description "Time duration that the record will be valid for. This accepts durations such as '300s', '1.5h', '2h45m'. Valid time units are 'ns', 'us' (or 'µs'), 'ms', 's', 'm', 'h'. Default: 24h."
     :required false
     :spec :string}
    :allow-offline
    {:name "allow-offline"
     :description "When offline, save the IPNS record to the local datastore without broadcasting to the network instead of simply failing."
     :required false
     :spec :boolean}
    :ttl
    {:name "ttl"
     :description "Time duration the record should be cached for. Uses the same syntax as the lifetime option. Caution: experimental."
     :required false
     :spec :string}
    :key
    {:name "key"
     :description "Name of the key to be used or a valid PeerID, as listed by 'ipfs key list -l'. Default: self."
     :required false
     :spec :string}
    :quieter
    {:name "quieter"
     :description "Write only final hash."
     :required false
     :spec :boolean}
    :peer/id-base
    {:name "peerid-base"
     :description "Encoding used for peer IDs. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|.... Default: b58mh."
     :required false
     :spec ipfs.spec/peerid-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Name" ipfs.spec/key-name]
    ["Value" ipfs.spec/ipfs-path]]})

(def publish
  (ipfs.util/make-http ipfs.v0/api-base publish-desc))

;; /api/v0/name/resolve
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Path": "<string>",
;; }

(def resolve-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Resolve IPNS names."
   :resource/methods [:post]
   :resource/path "/name/resolve"
   :resource/params
   {:ipns/name
    {:name "arg"
     :description "The IPNS name to resolve. Defaults to your node's peer ID."
     :required false
     :spec ipfs.spec/ipns-name}
    :recursive
    {:name "recursive"
     :description "Resolve until the result is not an IPNS name. Default: true."
     :required false
     :spec :boolean}
    :nocache
    {:name "nocache"
     :description "Do not use cached entries."
     :required false
     :spec :boolean}
    :dht-record-count
    {:name "dht-record-count"
     :description "Number of records to request for DHT resolution."
     :required false
     :spec :int}
    :dht-timeout
    {:name "dht-timeout"
     :description "Max time to collect values during DHT resolution, e.g. '30s'. Pass 0 for no timeout."
     :required false
     :spec :string}
    :stream
    {:name "stream"
     :description "Stream entries as they are found."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Path" ipfs.spec/ipfs-path]]})

(def resolve
  (ipfs.util/make-http ipfs.v0/api-base resolve-desc))
