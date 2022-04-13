(ns com.kubelt.ipfs.v0.swarm.peering
  "Manipulate peering subsystem."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/swarm/peering add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "ID": "<peer-id>",
;;   "Status": "<string>"
;; }

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Add peers into the peering subsystem."
   :resource/methods [:post]
   :resource/path "/swarm/peering/add"
   :resource/params
   {:peer/addr
    {:name "arg"
     :description "Address of peer to add into the peering subsystem."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["ID" ipfs.spec/peer-id]
    ["Status" :string]]})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

;; /api/v0/swarm/peering/ls
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Peers": [
;;     {
;;       "Addrs": [
;;         "<multiaddr-string>"
;;       ],
;;       "ID": "peer-id"
;;     }
;;   ]
;; }

(def ls-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List peers registered in the peering subsystem."
   :resource/methods [:post]
   :resource/path "/swarm/peering/ls"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Peers" [:vector
              [:map
               ["ID" ipfs.spec/peer-id]
               ["Addrs" [:vector :string]]]]]]})

(def ls
  (ipfs.util/make-http ipfs.v0/api-base ls-desc))

;; /api/v0/swarm/peering/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "ID": "<peer-id>",
;;   "Status": "<string>"
;; }

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remove a peer from the peering subsystem."
   :resource/methods [:post]
   :resource/path "/swarm/peering/rm"
   :resource/params
   {:peer/id
    {:name "arg"
     :description "ID of peer to remove from the peering subsystem."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["ID" ipfs.spec/peer-id]
    ["Status" :string]]})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))
