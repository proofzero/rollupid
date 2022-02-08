(ns com.kubelt.ipfs.v0.pin.remote
  "Methods for pinning content remotely."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/pin/remote/add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Cid": "<string>",
;;   "Name": "<string>",
;;   "Status": "<string>"
;; }

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Pin object to remote pinning service."
   :resource/methods [:post]
   :resource/path "/pin/remote/add"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "Path to object(s) to be pinned."
     :required true
     :spec ipfs.spec/ipfs-path}
    :service/name
    {:name "service"
     :description "Name of the remote pinning service to use (mandatory)."
     :required true
     :spec :string}
    :pin/name
    {:name "name"
     :description "An optional name for the pin."
     :required false
     :spec :string}
    :remote/background?
    {:name "background"
     :description "Add to the queue on the remote service and return immediately (does not wait for pinned status). Default: false."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Cid" :string]
    ["Name" :string]
    ["Status" :string]]})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

;; /api/v0/pin/remote/ls
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Cid": "<string>",
;;   "Name": "<string>",
;;   "Status": "<string>"
;; }

(def ls-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List objects pinned to remote pinning service."
   :resource/methods [:post]
   :resource/path "/pin/remote/ls"
   :resource/params
   {:service/name
    {:name "service"
     :description "Name of the remote pinning service to use (mandatory)."
     :required false
     :spec :string}
    :pin/name
    {:name "name"
     :description "Return pins with names that contain the value provided (case-sensitive, exact match)."
     :required false
     :spec :string}
    :pin/cid
    {:name "cid"
     :description "Return pins for the specified CIDs."
     :required false
     :spec [:vector :string]}
    :pin/status
    {:name "status"
     :description "Return pins with the specified statuses (queued, pinning, pinned, failed). Default: pinned."
     :required false
     :spec [:enum "queued" "pinning" "pinned" "failed"]}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Cid" :string]
    ["Name" :string]
    ["Status" :string]]})

(def ls
  (ipfs.util/make-http ipfs.v0/api-base ls-desc))

;; /api/v0/pin/remote/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain response body.

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remove pins from remote pinning service."
   :resource/methods [:post]
   :resource/path "/pin/remote/rm"
   :resource/params
   {:service/name
    {:name "service"
     :description "Name of the remote pinning service to use (mandatory)."
     :required true
     :spec :string}
    :pin/name
    {:name "name"
     :description "Remove pins with names that contain provided value (case-sensitive, exact match)."
     :required false
     :spec :string}
    :pin/cid
    {:name "cid"
     :description "Remove pins for the specified CIDs."
     :required false
     :spec [:vector :string]}
    :pin/status
    {:name "status"
     :description "Remove pins with the specified status (queued, pinning, pinned, failed). Default: pinned."
     :required false
     :spec [:vector :string]}
    :remote/force
    {:name "force"
     :description "Allow remove of multiple pins matching the query without additional confirmation. Default: false."
     :required false
     :spec :boolean}}
   ;; TODO check that this returns a text/plain response.
   :response/types ["text/plain"]
   :response/spec
   []})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))
