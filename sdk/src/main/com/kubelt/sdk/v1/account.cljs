(ns com.kubelt.sdk.v1.account
  ""
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"})

;; create-account
;; -----------------------------------------------------------------------------

;; TODO test me
(defn create!
  "Create an account."
  []
  ;; TODO

  ;; - given a public key (or PK-derived identifier), first check that the
  ;;   account doesn't already exist
  ;;   - if exists, return existing account and/or error
  ;;   - if not exists:
  ;;     - request naming account creation using naming client
  ;;     - create initial MeDAG in local quad store
  ;;     - store MeDAG to IPFS to get CID
  ;;     - store CID for public key in naming system
  ;;     - return ??
  )

;; TODO test me
(defn create-js!
  "Create an account from a JavaScript context."
  []
  ;; TODO convert args to edn
  (create!))
