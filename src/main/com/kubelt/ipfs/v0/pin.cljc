(ns com.kubelt.ipfs.v0.pin
  "Methods for pinning content."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [update])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/pin/add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Pins": [
;;     "<string>"
;;   ],
;;   "Progress": "<int>"
;; }

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Pin objects to local storage."
   :resource/methods [:post]
   :resource/path "/pin/add"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "Path to the object(s) to be pinned."
     :required true
     :spec ipfs.spec/ipfs-path}
    :pin/recursive
    {:name "recursive"
     :description "Recursively pin the object linked to by the specified object(s). Default: true."
     :required false
     :spec :boolean}
    :out/progress
    {:name "progress"
     :description "Show progress."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Pins" [:vector :string]]
    ["Progress" :string]]})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

;; /api/v0/pin/ls
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "PinLsList": {
;;     "Keys": {
;;       "<string>": {
;;         "Type": "<string>"
;;       }
;;     }
;;   },
;;   "PinLsObject": {
;;     "Cid": "<string>",
;;     "Type": "<string>"
;;   }
;; }

(def ls-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List objects pinned to local storage."
   :resource/methods [:post]
   :resource/path "/pin/ls"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "Path to the object(s) to be listed."
     :required false
     :spec ipfs.spec/ipfs-path}
    :pin/type
    {:name "type"
     :description "The type of pinned keys to list. Can be 'direct', 'indirect', 'recursive', or 'all'. Default: all."
     :required false
     :spec [:enum "direct" "indirect" "recursive" "all"]}
    :quiet
    {:name "quiet"
     :description "Write just hashes of objects."
     :required false
     :spec :boolean}
    :stream
    {:name "stream"
     :description "Enable streaming of pins as they are discovered."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   ;; TODO this spec doesn't appear to be correct
   :response/spec
   [:map
    ["PinLsList"
     [:map
      ["Keys"
       [:map-of
        :string
        [:map
         ["Type" :string]]]]]]
    ["PinLsObject"
     [:map
      ["Cid" :string]
      ["Type" :string]]]]})

(def ls
  (ipfs.util/make-http ipfs.v0/api-base ls-desc))

;; /api/v0/pin/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Pins": [
;;     "<string>"
;;   ]
;; }

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remove pinned objects from local storage."
   :resource/methods [:post]
   :resource/path "/pin/rm"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "Path to the object(s) to be unpinned."
     :required true
     :spec ipfs.spec/ipfs-path}
    :pin/recursive
    {:name "recursive"
     :description "Recursively unpin the object linked to by the specified object(s). Default: true."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Pins" [:vector :string]]]})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))

;; /api/v0/pin/update
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Pins": [
;;     "<string>"
;;   ]
;; }

(def update-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Update a recursive pin."
   :resource/methods [:post]
   :resource/path "/pin/update"
   :resource/params
   {:ipfs/path-old
    {:name "arg"
     :description "Path to the old object."
     :required true
     :spec ipfs.spec/ipfs-path}
    :ipfs/path-new
    {:name "arg"
     :description "Path to the new object to be pinned."
     :required true
     :spec ipfs.spec/ipfs-path}
    :pin/unpin
    {:name "unpin"
     :description "Remove the old pin. Default: true."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Pins" [:vector :string]]]})

(def update
  (ipfs.util/make-http ipfs.v0/api-base update-desc))

;; /api/v0/pin/verify
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Cid": "<string>",
;;   "PinStatus": {
;;     "BadNodes": [
;;       {
;;         "Cid": "<string>",
;;         "Err": "<string>"
;;       }
;;     ],
;;     "Ok": "<bool>"
;;   }
;; }

(def verify-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Verify that recursive pins are complete."
   :resource/methods [:post]
   :resource/path "/pin/verify"
   ;; TODO support declaration of conflicting params.
   :resource/conflicts
   [#{:pin/broken? :pin/verbose?}]
   :resource/params
   {:pin/verbose?
    {:name "verbose"
     :description "Also write the hashes of non-broken pins."
     :required false
     :spec :boolean}
    :pin/broken?
    {:name "quiet"
     :description "Write just hashes of broken pins."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Cid" :string]
    ["PinStatus"
     [:map
      ["BadNodes"
       [:vector
        [:map
         ["Cid" :string]
         ["Err" :string]]]]
      ["Ok" :boolean]]]]})

(def verify
  (ipfs.util/make-http ipfs.v0/api-base verify-desc))
