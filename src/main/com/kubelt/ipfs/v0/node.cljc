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
    [:id ipfs.spec/peer-id]
    [:public-key ipfs.spec/public-key]
    [:addresses ipfs.spec/addresses]
    [:agent-version ipfs.spec/agent-version]
    [:protocol-version ipfs.spec/protocol-version]
    [:protocols ipfs.spec/protocols]]})

(def id
  (ipfs.util/make-http ipfs.v0/api-base id-desc))

;; /api/v0/add
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Bytes": "<int64>",
;;   "Hash": "<string>",
;;   "Name": "<string>",
;;   "Size": "<string>"
;; }

;; TODO Extract into shared utility method. Cf. v0.key/key-body.
(defn- add-body
  [param-name part-data]
  {:com.kubelt/type :kubelt.type/multipart
   :multipart
   [{:param/name param-name
     :part/content part-data
     ;; TODO use media type from library.
     :part/media-type "application/octet-stream"}]})

(def add-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Add a file or directory to IPFS."
   :resource/methods [:post]
   :resource/path "/add"
   :resource/params
   {:node/quiet?
    {:name "quiet"
     :description "Write minimal output."
     :required false
     :spec :boolean}
    :node/quieter?
    {:name "quieter"
     :description "Write only final hash."
     :required false
     :spec :boolean}
    :node/silent?
    {:name "silent"
     :description "Write no output."
     :required false
     :spec :boolean}
    :node/progress?
    {:name "progress"
     :description "Stream progress data."
     :required false
     :spec :boolean}
    :node/trickle?
    {:name "trickle"
     :description "Use trickle-dag format for dag generation."
     :required false
     :spec :boolean}
    :node/only-hash?
    {:name "only-hash"
     :description "Only chunk and hash; do not write to disk."
     :required false
     :spec :boolean}
    :node/wrap-directory?
    {:name "wrap-with-directory"
     :description "Wrap files with a directory object."
     :required false
     :spec :boolean}
    :node/chunker
    {:name "chunker"
     :description "Chunking algorithm. Options: size-[bytes], rabin-[min]-[avg]-[max] or buzhash."
     :default "size-262144"
     :required false
     :spec :string}
    :node/pin?
    {:name "pin"
     :description "Pin this object when adding."
     :default true
     :required false
     :spec :boolean}
    :node/raw-leaves?
    {:name "raw-leaves"
     :description "Use raw blocks for leaf nodes."
     :required false
     :spec :boolean}
    :node/no-copy?
    {:name "nocopy"
     :description "Add the file using filestore. Implies raw-leaves."
     :status :experimental
     :implies :node/raw-leaves?
     :required false
     :spec :boolean}
    :node/fs-cache?
    {:name "fscache"
     :description "Check the filestore for pre-existing blocks."
     :status :experimental
     :required false
     :spec :boolean}
    :cid/version
    {:name "cid-version"
     :description "CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. Passing version 1 will cause the raw-leaves option to default to true."
     :required false
     :spec ipfs.spec/cid-version}
    :hash/fn
    {:name "hash"
     :description "Hash function to use. Implies CIDv1 if not sha2-256."
     :status :experimental
     :default "sha2-256"
     :required false
     :spec ipfs.spec/dag-hash}
    :node/inline?
    {:name "inline"
     :description "Inline small blocks into CIDs."
     :status :experimental
     :required false
     :spec :boolean}
    :inline/limit
    {:name "inline-limit"
     :description "Maximum block size to inline."
     :status :experimental
     :default 32
     :required false
     :spec :int}}

   :resource/body
   {:key/data
    {:name "key"
     :description "PEM-encoded key data to send."
     :required true
     :spec #?@(:clj [bytes?]
               ;; TODO find better constraint than :any
               :cljs [:any])}}
   :resource/body-fn add-body

   :response/types ["application/json"]
   :response/spec
   [:map
    ["Bytes" :string]
    ["Hash" :string]
    ["Name" :string]
    ["Size" :string]]})

(def add
  (ipfs.util/make-http ipfs.v0/api-base add-desc))

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
