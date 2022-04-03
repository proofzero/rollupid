(ns com.kubelt.ipfs.v0.pin.remote.service
  "Methods for managing remote pinning services."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/pin/remote/service/add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain body.

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Add remote pinning service."
   :resource/methods [:post]
   :resource/path "/pin/remote/service/add"
   :resource/params
   {:service/name
    {:name "arg"
     :description "Service name."
     :required true
     :spec :string}
    :service/endpoint
    {:name "arg"
     :description "Service endpoint."
     :required true
     :spec :string}
    :service/key
    {:name "arg"
     :description "Service key."
     :required true
     :spec :string}}
   ;; TODO check that response has text/plain body.
   :response/types ["text/plain"]
   :response/spec
   []})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

;; /api/v0/pin/remote/service/ls
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "RemoteServices": [
;;     {
;;       "ApiEndpoint": "<string>",
;;       "Service": "<string>",
;;       "Stat": {
;;         "PinCount": {
;;           "Failed": "<int>",
;;           "Pinned": "<int>",
;;           "Pinning": "<int>",
;;           "Queued": "<int>"
;;         },
;;         "Status": "<string>"
;;       }
;;     }
;;   ]
;; }

(def ls-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List remote pinning services."
   :resource/methods [:post]
   :resource/path "/pin/remote/service/ls"
   :resource/params
   {:service/stat?
    {:name "stat"
     :description "Try to fetch and display current pin count on remote service (queued, pinning, pinned, failed). Default: false."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    "RemoteServices"
    [:vector
     [:map
      ["ApiEndpoint" ipfs.spec/api-endpoint]
      ["Service" :string]
      ["Stat" {:optional true}
       [:map
        ["PinCount"
         [:map
          ["Failed" :int]
          ["Pinned" :int]
          ["Pinning" :int]
          ["Queued" :int]]]
        ["Status" :string]]]]]]})

(def ls
  (ipfs.util/make-http ipfs.v0/api-base ls-desc))

;; /api/v0/pin/remote/service/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain response body.

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remove a remote pinning service."
   :resource/methods [:post]
   :resource/path "/pin/remote/service/rm"
   :resource/params
   {:service/name
    {:name "arg"
     :description "Name of remote pinning service to remove."
     :required true
     :spec :string}}
   ;; TODO check that this returns a text/plain response.
   :response/types ["text/plain"]
   :response/spec
   []})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))
