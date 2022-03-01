(ns com.kubelt.ipfs.v0.dag
  "Methods for working with DAGs."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:refer-clojure :exclude [get import resolve])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]
   [com.kubelt.lib.json :as lib.json]))

;; TODO Extract into shared utility method.
(defn- multipart-body
  [param-name data]
  (let [part-data (if (coll? data)
                    (lib.json/edn->json-str data)
                    data)
        ;; TODO use media type from library.
        media-type (if (string? part-data)
                     "text/plain"
                     "application/octet-stream")]
    {:com.kubelt/type :kubelt.type/multipart
     :multipart
     [{:param/name param-name
       :part/content part-data
       :part/media-type media-type}]}))

;; /api/v0/dag/export
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain response body.

(def export-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Streams the selected DAG as a .car stream on stdout."
   :resource/methods [:post]
   :resource/path "/dag/export"
   :resource/params
   {:dag/root
    {:name "arg"
     :description "CID of a root to recursively export."
     :required true
     :spec :string}
    :dag/progress?
    {:name "progress"
     :description "Display progress on CLI. Defaults to true when STDERR is a TTY."
     :required false
     :spec :boolean}}
   :response/types ["text/plain"]
   :response/spec
   []})

(def export
  (ipfs.util/make-http ipfs.v0/api-base export-desc))

;; /api/v0/dag/get
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain response body.

(def get-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Get a DAG node from IPFS."
   :resource/methods [:post]
   :resource/path "/dag/get"
   :resource/params
   {:dag/root
    {:name "arg"
     :description "The object to get."
     :required true
     :spec :string}
    :output/codec
    {:name "output-codec"
     :description "Format the object will be encoded as. Default: dag-json."
     :required false
     :spec ipfs.spec/dag-codec}}
   :response/types ["text/plain"]
   ;; Whatever output codec is used, the response is always a string and
   ;; the response type is "text/plain".
   :response/spec :string
   :response/body-fn
   (fn [resource body]
     (let [codec (get-in resource [:parameter/data :output/codec])]
       (if (= "dag-cbor" codec)
         ;; Nothing to do for dag-cbor?
         body
         ;; If :output/codec not specified, IPFS outputs using dag-json
         ;; codec; parse JSON string into edn.
         (lib.json/json-str->edn body))))})

(def get
  (ipfs.util/make-http ipfs.v0/api-base get-desc))

;; /api/v0/dag/import
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Root": {
;;     "Cid": {
;;       "/": "<cid-string>"
;;     },
;;     "PinErrorMsg": "<string>"
;;   },
;;   "Stats": {
;;     "BlockBytesCount": "<uint64>",
;;     "BlockCount": "<uint64>"
;;   }
;; }
;;
;; cURL example:
;; $ curl -X POST -F file=@myfile
;; "http://127.0.0.1:5001/api/v0/dag/import?pin-roots=true&silent=<value>&stats=<value>"

(def import-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Import the contents of .car files."
   :resource/methods [:post]
   :resource/path "/dag/import"
   :resource/params
   {:dag/pin-roots?
    {:name "pin-roots"
     :description "Pin optional roots listed in the .car headers after importing. Default: true."
     :required false
     :spec :boolean}
    :dag/silent?
    {:name "silent"
     :description "No output."
     :required false
     :spec :boolean}
    :dag/stats?
    {:name "stats"
     :description "Output stats."
     :required false
     :spec :boolean}}
   :resource/body
   {:dag/data
    {:name "file"
     :description "DAG data to send."
     :required true
     :spec #?@(:clj [bytes?]
               ;; TODO find better constraint than :any
               :cljs [:any])}}
   :resource/body-fn multipart-body
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Pins" [:vector :string]]]})

(def import
  (ipfs.util/make-http ipfs.v0/api-base import-desc))

;; /api/v0/dag/put
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Cid": {
;;     "/": "<cid-string>"
;;   }
;; }
;;
;; cURL example:
;; $ curl -X POST -F file=@myfile
;; "http://127.0.0.1:5001/api/v0/dag/put?store-codec=dag-cbor&input-codec=dag-json&pin=<value>&hash=sha2-256"

(def put-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Add a DAG node to IPFS."
   :resource/methods [:post]
   :resource/path "/dag/put"
   :resource/params
   {:codec/store
    {:name "store-codec"
     :description "Codec that the stored object will be encoded with. Default: dag-cbor."
     :required false
     :spec ipfs.spec/dag-codec}
    :codec/input
    {:name "input-codec"
     :description "Codec that the input object is encoded in. Default: dag-json."
     :required false
     :spec ipfs.spec/dag-codec}
    :dag/pin?
    {:name "pin"
     :description "Pin this object when adding."
     :required false
     :spec :boolean}
    :dag/hash
    {:name "hash"
     :description "Hash function to use."
     :required false
     :spec ipfs.spec/dag-hash}}
   :resource/body
   {:dag/data
    {:name "file"
     :description "DAG data to send."
     :required true
     :spec [:or ipfs.spec/dag-cbor ipfs.spec/dag-json]}}
   :resource/body-fn multipart-body
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Cid"
     [:map
      ;; TODO this should be a <cid-string>.
      ["/" :string]]]]})

(def put
  (ipfs.util/make-http ipfs.v0/api-base put-desc))

;; /api/v0/dag/resolve
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Cid": {
;;     "/": "<cid-string>"
;;   },
;;   "RemPath": "<string>"
;; }
;;
;; cURL example:
;; $ curl -X POST -F "http://127.0.0.1:5001/api/v0/dag/resolve?arg=<ref>"

(def resolve-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Resolve IPLD block."
   :resource/methods [:post]
   :resource/path "/dag/resolve"
   :resource/params
   {:ipfs/path
    {:name "arg"
     :description "The path to resolve."
     :required true
     :spec ipfs.spec/ipfs-path}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Cid"
     [:map
      ;; TODO this should be a <cid-string>.
      ["/" :string]]]
    ["RemPath" :string]]})

(def resolve
  (ipfs.util/make-http ipfs.v0/api-base resolve-desc))

;; /api/v0/dag/stat
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "NumBlocks": "<int64>",
;;   "Size": "<uint64>"
;; }
;;
;; cURL example:
;; $ curl -X POST -F "http://127.0.0.1:5001/api/v0/dag/stat?arg=<root>&progress=true"

(def stat-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Get stats for a DAG."
   :resource/methods [:post]
   :resource/path "/dag/stat"
   :resource/params
   {:dag/root
    {:name "arg"
     :description "CID of a DAG root to get statistics for."
     :required true
     :spec ipfs.spec/content-id}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ;; <int64>
    ["NumBlocks" :int]
    ;; <uint64>
    ["Size" :int]]})

(def stat
  (ipfs.util/make-http ipfs.v0/api-base stat-desc))
