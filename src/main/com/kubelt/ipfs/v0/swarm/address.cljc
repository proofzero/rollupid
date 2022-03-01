(ns com.kubelt.ipfs.v0.swarm.address
  "Methods for investigating a libp2p swarm."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/swarm/addrs/listen
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def listen-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List interface listening addresses."
   :resource/methods [:post]
   :resource/path "/swarm/addrs/listen"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    [:map
     ["Strings" [:vector :string]]]]})

(def listen
  (ipfs.util/make-http ipfs.v0/api-base listen-desc))

;; /api/v0/swarm/addrs/local
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def local-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List local addresses."
   :resource/methods [:post]
   :resource/path "/swarm/addrs/local"
   :resource/params
   {:addrs/show-id?
    {:name "id"
     :description "Show peer ID in addresses."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    [:map
     ["Strings" [:vector :string]]]]})

(def local
  (ipfs.util/make-http ipfs.v0/api-base local-desc))
