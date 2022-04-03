(ns com.kubelt.ipfs.v0.node
  "Methods for learning about an IPFS node."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/id
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Addresses": [
;;     "<string>"
;;   ],
;;   "AgentVersion": "<string>",
;;   "ID": "<string>",
;;   "ProtocolVersion": "<string>",
;;   "Protocols": [
;;     "<string>"
;;   ],
;;   "PublicKey": "<string>"
;; }

(def id-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Show IPFS node id info."
   :resource/methods [:post]
   :resource/path "/id"
   :resource/params
   {:peer/id
    {:name "arg"
     :description "Peer.ID of node to look up."
     :required false
     :spec :string}
    :output/format
    {:name "format"
     :description "Optional output format."
     :required false
     :spec :string}
    :peer/id-base
    {:name "peerid-base"
     :description "Encoding used for peer IDs. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|.... Default: b58mh."
     :required false
     :spec ipfs.spec/peerid-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["ID" ipfs.spec/peer-id]
    ["PublicKey" ipfs.spec/public-key]
    ["Addresses" ipfs.spec/addresses]
    ["AgentVersion" ipfs.spec/agent-version]
    ["ProtocolVersion" ipfs.spec/protocol-version]
    ["Protocols" ipfs.spec/protocols]]})

(def id
  (ipfs.util/make-http ipfs.v0/api-base id-desc))

;; /api/v0/ping
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Success": "<bool>",
;;   "Text": "<string>",
;;   "Time": "<duration-ns>"
;; }

(def ping-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Send echo request packets to IPFS hosts."
   :resource/methods [:post]
   :resource/path "/id"
   :resource/params
   {:peer/id
    {:name "arg"
     :description "Peer ID of peer to be pinged."
     :required true
     :spec ipfs.spec/peer-id}
    :ping/count
    {:name "count"
     :description "Number of ping messages to send. Default: 10."
     :required false
     :spec :int}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Success" :string]
    ["Text" :string]
    ["Addresses" :string]]})

(def ping
  (ipfs.util/make-http ipfs.v0/api-base ping-desc))

;; /api/v0/version
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Commit": "<string>",
;;   "Golang": "<string>",
;;   "Repo": "<string>",
;;   "System": "<string>",
;;   "Version": "<string>"
;; }

(def version-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Show IPFS version information."
   :resource/methods [:post]
   :resource/path "/version"
   :resource/params
   {:node/version-only?
    {:name "number"
     :description "Only show the version number."
     :required false
     :spec :boolean}
    :node/commit?
    {:name "commit"
     :description "Show the commit hash."
     :required false
     :spec :boolean}
    :node/repo?
    {:name "repo"
     :description "Show repo version."
     :required false
     :spec :boolean}
    :node/all?
    {:name "all"
     :description "Show all version information"
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Commit" :string]
    ["Golang" :string]
    ["Repo" :string]
    ["System" :string]
    ["Version" :string]]})

(def version
  (ipfs.util/make-http ipfs.v0/api-base version-desc))

;; /api/v0/version/deps
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Path": "<string>",
;;   "ReplacedBy": "<string>",
;;   "Sum": "<string>",
;;   "Version": "<string>"
;; }

(def deps-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Show information about dependencies used for build."
   :resource/methods [:post]
   :resource/path "/version/deps"
   :resource/params
   {}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Path" :string]
    ["ReplacedBy" :string]
    ["Sum" :string]
    ["Version" :string]]})

(def deps
  (ipfs.util/make-http ipfs.v0/api-base deps-desc))
