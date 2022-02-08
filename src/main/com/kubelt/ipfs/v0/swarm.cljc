(ns com.kubelt.ipfs.v0.swarm
  "Methods for investigating a libp2p swarm."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/swarm/addrs
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Addrs": {
;;     "<string>": [
;;       "<string>"
;;     ]
;;   }
;; }

(def addrs-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List known addresses. Useful for debugging."
   :resource/methods [:post]
   :resource/path "/swarm/addrs"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Addrs"
     [:map-of :string [:vector :string]]]]})

(def addrs
  (ipfs.util/make-http ipfs.v0/api-base addrs-desc))

;; /api/v0/swarm/connect
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def connect-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Open connection to a given address."
   :resource/methods [:post]
   :resource/path "/swarm/connect"
   :resource/params
   {:peer/address
    {:name "arg"
     :description "Address of a peer to connect to."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Strings" [:vector :string]]]})

(def connect
  (ipfs.util/make-http ipfs.v0/api-base connect-desc))

;; /api/v0/swarm/disconnect
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def disconnect-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Close connection to a given address."
   :resource/methods [:post]
   :resource/path "/swarm/disconnect"
   :resource/params
   {:peer/address
    {:name "arg"
     :description "Address of peer to disconnect from."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Strings" [:vector :string]]]})

(def disconnect
  (ipfs.util/make-http ipfs.v0/api-base disconnect-desc))

;; /api/v0/swarm/filters
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def filters-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Manipulate address filters."
   :resource/methods [:post]
   :resource/path "/swarm/filters"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Strings" [:vector :string]]]})

(def filters
  (ipfs.util/make-http ipfs.v0/api-base filters-desc))

;; /api/v0/swarm/peers
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Peers": [
;;     {
;;       "Addr": "<string>",
;;       "Direction": "<int>",
;;       "Latency": "<string>",
;;       "Muxer": "<string>",
;;       "Peer": "<string>",
;;       "Streams": [
;;         {
;;           "Protocol": "<string>"
;;         }
;;       ]
;;     }
;;   ]
;; }

(def peers-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List peers with open connections."
   :resource/methods [:post]
   :resource/path "/swarm/peers"
   :resource/params
   {:swarm/verbose?
    {:name "verbose"
     :description "Display all extra information."
     :required false
     :spec :boolean}
    :swarm/streams?
    {:name "streams"
     :description "Also list information about open streams for each peer."
     :required false
     :spec :boolean}
    :swarm/latency?
    {:name "latency"
     :description "Also list information about latency to each peer."
     :required false
     :spec :boolean}
    :swarm/direction?
    {:name "direction"
     :description "Also list information about the direction of connection."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Peers" [:vector
              [:map
               ["Addr" :string]
               ["Direction" :string]
               ["Latency" :string]
               ["Muxer" :string]
               ["Peer" :string]
               ["Streams" [:vector
                           [:map
                            ["Protocol" :string]]]]]]]]})

(def peers
  (ipfs.util/make-http ipfs.v0/api-base peers-desc))
