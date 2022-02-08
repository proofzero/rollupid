(ns com.kubelt.ipfs.v0.key
  "Methods for manipulating IPFS node keys."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:refer-clojure :exclude [import list])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/key/export
;; -----------------------------------------------------------------------------
;; On success returns 200 status and a text/plain response body.
;;
;; TODO how best to handle a text/plain response body?
;;
;; NOTE: trying to curl this method on a local IPFS daemon returns 404,
;; but we can successfully use the CLI to export the key data:
;;   $ ipfs key export foobar
;; The CLI is supposedly using the REST HTTP interface, so what gives?

#_(def export
  (ipfs.core/make-http ipfs.v0/api-base
   {:com.kubelt/type :kubelt.type/api-resource
    :resource/description "Export a keypair."
    :resource/methods [:post]
    :resource/path "/key/export"
    :resource/params
    {:key/name
     {:name "arg"
      :description "The name of the key to export."
      :required true
      :spec ipfs.spec/key-name}
     :output
     {:name "output"
      :description "The path where the output should be stored."
      :required false
      :spec :string}}
    :response/spec
    []}))

;; /api/v0/key/gen
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Id": "<string>",
;;   "Name": "<string>"
;; }

(def generate-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Create a new keypair."
   :resource/methods [:post]
   :resource/path "/key/gen"
   :resource/params
   {:key/name
    {:name "arg"
     :description "The name of the create to create."
     :required true
     :spec ipfs.spec/key-name}
    :key/type
    {:name "type"
     :description "The type of key to create: rsa, ed25519. Default ed25519."
     :required false
     :spec ipfs.spec/key-type}
    :key/size
    {:name "size"
     :description "The size of the key to generate."
     :required false
     :spec ipfs.spec/key-size}
    :ipns/base
    {:name "ipns-base"
     :description "Encoding used for keys. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|b.... Default: base36."
     :required false
     :spec ipfs.spec/ipns-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Name" ipfs.spec/key-name]
    ["Id" ipfs.spec/key-id]]})

(def generate
  (ipfs.util/make-http ipfs.v0/api-base generate-desc))

;; /api/v0/key/import
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Id": "<string>",
;;   "Name": "<string>"
;; }

;; TODO Extract into shared utility method.
(defn- key-body
  [param-name part-data]
  {:com.kubelt/type :kubelt.type/multipart
   :multipart
   [{:param/name param-name
     :part/content part-data
     ;; TODO use media type from library.
     :part/media-type "application/octet-stream"}]})

(def import-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Import a key and print imported key id."
   :resource/methods [:post]
   :resource/path "/key/import"
   :resource/params
   {:key/name
    {:name "arg"
     :description "Name to associate with key in keychain."
     :required true
     :spec ipfs.spec/key-name}
    :ipns/base
    {:name "ipns-base"
     :description "Encoding used for keys. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|b.... Default: base36."
     :required false
     :spec ipfs.spec/ipns-base}}
   :resource/body
   {:key/data
    {:name "key"
     :description "PEM-encoded key data to send."
     :required true
     :spec bytes?}}
   :resource/body-fn key-body
   :response/types ["application/json"]
   :response/spec
   [:map
    [:map
     ["Name" ipfs.spec/key-name]
     ["Id" ipfs.spec/key-id]]]})

(def import
  (ipfs.util/make-http ipfs.v0/api-base import-desc))

;; /api/v0/key/list
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Keys": [
;;     {
;;       "Id": "<string>",
;;       "Name": "<string>"
;;     }
;;   ]
;; }

(def list-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List all local keypairs."
   :resource/methods [:post]
   :resource/path "/key/list"
   :resource/params
   {:verbose
    {:name "l"
     :description "Show extra information about keys."
     :required false
     :spec :boolean}
    :ipns/base
    {:name "ipns-base"
     :description "Encoding used for keys. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|b.... Default: base36."
     :required false
     :spec ipfs.spec/ipns-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Keys"
     [:vector
      [:map
       ["Name" ipfs.spec/key-name]
       ["Id" ipfs.spec/key-id]]]]]})

(def list
  (ipfs.util/make-http ipfs.v0/api-base list-desc))

;; /api/v0/key/rename
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Id": "<string>",
;;   "Now": "<string>",
;;   "Overwrite": "<bool>",
;;   "Was": "<string>"
;; }

(def rename-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Rename a keypair."
   :resource/methods [:post]
   :resource/path "/key/rename"
   :resource/params
   {:key/old-name
    {:name "arg"
     :description "The name of the key to rename."
     :required true
     :spec ipfs.spec/key-name}
    :key/new-name
    {:name "arg"
     :description "The new name of the key being renamed."
     :required true
     :spec ipfs.spec/key-name}
    :key/force
    {:name "force"
     :description "Allow an existing key to be overwritten."
     :required false
     :spec :boolean}
    :ipns/base
    {:name "ipns-base"
     :description "Encoding used for keys. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|b.... Default: base36."
     :required false
     :spec ipfs.spec/ipns-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Was" ipfs.spec/key-name]
    ["Now" ipfs.spec/key-name]
    ["Id" ipfs.spec/key-id]
    ["Overwrite" :boolean]]})

(def rename
  (ipfs.util/make-http ipfs.v0/api-base rename-desc))

;; /api/v0/key/rm
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body:
;;
;; {
;;   "Keys": [
;;     {
;;       "Id": "<string>",
;;       "Name": "<string>"
;;     }
;;   ]
;; }

(def rm-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Remove a keypair."
   :resource/methods [:post]
   :resource/path "/key/rm"
   :resource/params
   {:key/name
    {:name "arg"
     :description "The names of the keys to remove."
     :required true
     :spec ipfs.spec/key-name}
    :verbose
    {:name "l"
     :description "Show extra information about keys."
     :required false
     :spec :boolean}
    :ipns/base
    {:name "ipns-base"
     :description "Encoding used for keys. Can either be a multibase encoded CID or a base58btc encoded multihash. Takes b58mh|base36|k|base32|b.... Default: base36."
     :required false
     :spec ipfs.spec/ipns-base}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["Keys"
     [:vector
      [:map
       ["Name" ipfs.spec/key-name]
       ["Id" ipfs.spec/key-id]]]]]})

(def rm
  (ipfs.util/make-http ipfs.v0/api-base rm-desc))
