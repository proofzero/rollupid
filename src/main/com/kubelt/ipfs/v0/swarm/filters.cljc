(ns com.kubelt.ipfs.v0.swarm.filters
  "Manipulate address filters."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/swarm/filters/add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Add an address filter."
   :resource/methods [:post]
   :resource/path "/swarm/filters/add"
   :resource/params
   {:multi/addr
    {:name "arg"
     :description "Multiaddr to filter."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
     ["Strings" [:vector :string]]]})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

;; /api/v0/swarm/filters/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Strings": [
;;     "<string>"
;;   ]
;; }

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remote an address filter."
   :resource/methods [:post]
   :resource/path "/swarm/filters/rm"
   :resource/params
   {:multi/addr
    {:name "arg"
     :description "Multiaddr filter to remote."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Strings" [:vector :string]]]})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))
