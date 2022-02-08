(ns com.kubelt.ipfs.v0.cid
  "Methods for obtaining information about CIDs."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:refer-clojure :exclude [bases format])
  (:require
   [com.kubelt.ipfs.spec :as ipfs.spec]
   [com.kubelt.ipfs.util :as ipfs.util]
   [com.kubelt.ipfs.v0 :as ipfs.v0]))

;; /api/v0/cid/base32
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "CidStr": "<string>",
;;   "ErrorMsg": "<string>",
;;   "Formatted": "<string>"
;; }

(def base32-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Convert CIDs to Base32 CID version 1."
   :resource/methods [:post]
   :resource/path "/cid/base32"
   :resource/params
   {:dag/root
    {:name "arg"
     :description "CIDs to convert."
     :required true
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["CidStr" :string]
    ["ErrorMsg" :string]
    ["Formatted" :string]]})

(def base32
  (ipfs.util/make-http ipfs.v0/api-base base32-desc))

;; /api/v0/cid/bases
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; [
;;   {
;;     "Code": "<int>",
;;     "Name": "<string>"
;;   }
;; ]

(def bases-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List available multibase encodings."
   :resource/methods [:post]
   :resource/path "/cid/bases"
   :resource/params
   {:cid/prefix?
    {:name "prefix"
     :description "Also include single letter prefixes in addition to the code."
     :required false
     :spec :boolean}
    :cid/numeric?
     {:name "numeric"
      :description "Also include numeric codes."
      :required false
      :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:vector
    [:map
     ["Code" :string]
     ["Name" :string]]]})

(def bases
  (ipfs.util/make-http ipfs.v0/api-base bases-desc))

;; /api/v0/cid/codecs
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; [
;;   {
;;     "Code": "<int>",
;;     "Name": "<string>"
;;   }
;; ]

(def codecs-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List available codecs."
   :resource/methods [:post]
   :resource/path "/cid/codecs"
   :resource/params
   {:cid/numeric?
    {:name "numeric"
     :description "Also include numeric codes."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:vector
    [:map
     ["Code" :string]
     ["Name" :string]]]})

(def codecs
  (ipfs.util/make-http ipfs.v0/api-base codecs-desc))

;; /api/v0/cid/format
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; {
;;   "CidStr": "<string>",
;;   "ErrorMsg": "<string>",
;;   "Formatted": "<string>"
;; }

(def format-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "Format and convert a CID in various useful ways."
   :resource/methods [:post]
   :resource/path "/cid/format"
   :resource/params
   {:cid/data
    {:name "arg"
     :description "CIDs to format."
     :required true
     ;; TODO better spec
     :spec :string}
    :cid/format
    {:name "f"
     :description "Printf-style format string. Default: %s."
     :required false
     ;; TODO better spec
     :spec :string}
    :cid/version
    {:name "v"
     :description "CID version to convert to."
     :required false
     ;; TODO better spec
     :spec :string}
    :cid/codec
    {:name "codec"
     :description "CID codec to convert to."
     :required false
     ;; TODO better spec
     :spec :string}
    :cid/multibase
    {:name "b"
     :description "Multibase to display CID in."
     :required false
     ;; TODO better spec
     :spec :string}}
   :response/types ["application/json"]
   :response/spec
   [:map
    ["CidStr" :string]
    ["ErrorMsg" :string]
    ["Formatted" :string]]})

(def format
  (ipfs.util/make-http ipfs.v0/api-base format-desc))

;; /api/v0/cid/hashes
;; -----------------------------------------------------------------------------
;; On success returns 200 status and the following body.
;;
;; [
;;   {
;;     "Code": "<int>",
;;     "Name": "<string>"
;;   }
;; ]

(def hashes-desc
  {:com.kubelt/type :kubelt.type/api-resource
   :resource/description "List available multihashes."
   :resource/methods [:post]
   :resource/path "/cid/hashes"
   :resource/params
   {:cid/numeric?
    {:name "numeric"
     :description "Also include numeric codes."
     :required false
     :spec :boolean}}
   :response/types ["application/json"]
   :response/spec
   [:vector
    [:map
     ["Code" :string]
     ["Name" :string]]]})

(def hashes
  (ipfs.util/make-http ipfs.v0/api-base hashes-desc))
