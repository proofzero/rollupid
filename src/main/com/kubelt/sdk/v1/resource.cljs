(ns com.kubelt.sdk.v1.resource
  "Resource management."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"})

;; add!
;; -----------------------------------------------------------------------------

;; TODO test me
(defn add!
  "Add a resource."
  [sys meta-data data]
  ;; ARGS
  ;; - sys: our system map resulting from SDK initialization.
  ;;
  ;; - meta: JSON-LD data describing the data; as JSON-LD format data
  ;;   can be transformed into RDF triples that we'll add to our
  ;;   workspace DAG.
  ;;
  ;; - data: a data object of some kind; may be a CID (object? string?),
  ;;   JSON data, etc. If a CID, the metadata is considered to be a
  ;;   description of an already available IPFS object. If given other
  ;;   kinds of data, the expectation is that we would publish that data
  ;;   to obtain a CID, which as before would be added as a "fat link"
  ;;   in the metadata and included in the workspace DAG.
  ;;
  ;; Flow:
  ;; - interrogate p2p for CID of user's "me" workspace DAG
  ;; - fetch DAG and inflate into our in-memory triplestore
  ;; - obtain CID of data being described:
  ;;   - directly; we are given it as the "data" parameter
  ;;   - indirectly; store the data in IPFS ourselves
  ;; - describe CID using kubelt IPFS vocabulary (kubelt:Link)
  ;; - merge link description with given metadata
  ;; - add to user's "me" workspace DAG
  ;; - write DAG to IPFS via DAG API to obtain new CID
  ;; - update p2p name mapping with the new workspace CID
  )

;; TODO test me
(defn add-js!
  "Create an account from a JavaScript context."
  [sys meta-data data]
  ;; TODO convert args to edn.
  (add! sys meta-data data))
