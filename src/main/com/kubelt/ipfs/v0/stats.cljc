(ns com.kubelt.ipfs.v0.stats
  "Obtain statistics from an IPFS daemon."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [format])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/stats/bitswap
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "BlocksReceived": "<uint64>",
;;   "BlocksSent": "<uint64>",
;;   "DataReceived": "<uint64>",
;;   "DataSent": "<uint64>",
;;   "DupBlksReceived": "<uint64>",
;;   "DupDataReceived": "<uint64>",
;;   "MessagesReceived": "<uint64>",
;;   "Peers": [
;;     "<string>"
;;   ],
;;   "ProvideBufLen": "<int>",
;;   "Wantlist": [
;;     {
;;       "/": "<cid-string>"
;;     }
;;   ]
;; }

(def bitswap-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Show some diagnostic information on the bitswap agent."
   :resource/methods [:post]
   :resource/path "/stats/bitswap"
   :resource/params
   {:stats/verbose?
    {:name "verbose"
     :description "Return extra information."
     :required false
     :spec :boolean}
    :stats/human?
    {:name "human"
     :description "Print sizes in human-readable format (e.g. 1K, 234M, 2G)."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["BlocksReceived" :string]
    ["BlocksSent" :string]
    ["DataReceived" :string]
    ["DataSent" :string]
    ["DupBlksReceived" :string]
    ["DupDataReceived" :string]
    ["MessagesReceiveed" :string]
    ["Peers" [:vector :string]]
    ["ProvideBufLen" :string]
    ["Wantlist" [:vector [:map ["/" :string]]]]]})

(def bitswap
  (ipfs.util/make-http ipfs.v0/api-base bitswap-desc))

;; /api/v0/stats/bw
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "RateIn": "<float64>",
;;   "RateOut": "<float64>",
;;   "TotalIn": "<int64>",
;;   "TotalOut": "<int64>"
;; }

(def bw-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Return IPFS bandwidth information."
   :resource/methods [:post]
   :resource/path "/stats/bw"
   :resource/params
   {:peer/id
    {:name "peer"
     :description "Specify a peer to return bandwidth for."
     :required false
     :spec :string}
    :stats/proto
    {:name "proto"
     :description "Specify a protocol to return bandwidth for."
     :required false
     :spec :string}
    :stats/poll?
    {:name "poll"
     :description "Print bandwidth at an interval."
     :required false
     :spec :boolean}
    :stats/interval
    {:name "interval"
     :description "Time interval to wait between updating output, if :stats/poll? is true. Accepts durations such as '300s', '1.5h', or '2h45m'. Valid time units are 'ns', 'us' (or 'µs'), 'ms', 's', 'm', 'h'. Default: 1s."
     :required false
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["RateIn" :string]
    ["RateOut" :string]
    ["TotalIn" :string]
    ["TotalOut" :string]]})

(def bw
  (ipfs.util/make-http ipfs.v0/api-base bw-desc))

;; /api/v0/stats/dht
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "Buckets": [
;;     {
;;       "LastRefresh": "<string>",
;;       "Peers": [
;;         {
;;           "AgentVersion": "<string>",
;;           "Connected": "<bool>",
;;           "ID": "<string>",
;;           "LastQueriedAt": "<string>",
;;           "LastUsefulAt": "<string>"
;;         }
;;       ]
;;     }
;;   ],
;;   "Name": "<string>"
;; }

(def dht-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Return statistics about the node's DHT(s)."
   :resource/methods [:post]
   :resource/path "/stats/dht"
   :resource/params
   {:table/name
    {:name "arg"
     :description "The DHT whose table should be listed (wanserver, lanserver, wan, lan). 'wan' and 'lan' refer to client routing tables. When using the experimental DHT client only WAN is supported. Default: 'wan', 'lan'."
     :required false
     :spec ipfs.spec/dht}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Buckets" [:vector
                [:map
                 ["LastRefresh" :string]
                 ["Peers" [:vector
                           [:map
                            ["AgentVersion" :string]
                            ["Connected" :string]
                            ["ID" :string]
                            ["LastQueriedAt" :string]
                            ["LastUsefulAt" :string]]]]] ]]
    ["Name" :string]]})

(def dht
  (ipfs.util/make-http ipfs.v0/api-base dht-desc))

;; /api/v0/stats/provide
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "AvgProvideDuration": "<duration-ns>",
;;   "LastReprovideBatchSize": "<int>",
;;   "LastReprovideDuration": "<duration-ns>",
;;   "TotalProvides": "<int>"
;; }

(def provide-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Return statistics about the node's (re)provider system."
   :resource/methods [:post]
   :resource/path "/stats/provide"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["AvgProvideDuration" :string]
    ["LastReprovideBatchSize" :string]
    ["LastReprovideDuration" :string]
    ["TotalProvides" :string]]})

(def provide
  (ipfs.util/make-http ipfs.v0/api-base provide-desc))

;; /api/v0/stats/repo
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "NumObjects": "<uint64>",
;;   "RepoPath": "<string>",
;;   "SizeStat": {
;;     "RepoSize": "<uint64>",
;;     "StorageMax": "<uint64>"
;;   },
;;   "Version": "<string>"
;; }

(def repo-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Return statistics for the currently used repo."
   :resource/methods [:post]
   :resource/path "/stats/repo"
   :resource/params
   {:stats/size-only?
    {:name "size-only"
     :description "Only report RepoSize and StorageMax."
     :required false
     :spec :boolean}
    :stats/human?
    {:name "human"
     :description "Print sizes in human-readable format (e.g. 1K, 234M, 2G)."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["NumObjects" :string]
    ["RepoPath" :string]
    ["SizeStat" [:map
                 ["RepoSize" :string]
                 ["StorageMax" :string]]]
    ["Version" :string]]})

(def repo
  (ipfs.util/make-http ipfs.v0/api-base repo-desc))
