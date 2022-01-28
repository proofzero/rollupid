(ns com.kubelt.sdk.v1.account
  "Account management."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; create!
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

  ;;     - request naming account creation using naming client can we
  ;;       - store the user's public key as a record? then all
  ;;         subsequent mutations or reads could be signed and
  ;;         validated. also look at JWT

  ;;     - create initial MeDAG in local quad store
  ;;     - store MeDAG to IPFS to get CID
  ;;     - store CID for public key in naming system
  ;;     - return ??

  ;; a flow for validating keypair ownership:
  ;; - client -> gateway: send nonce for public key <key>
  ;; - gateway -> client: nonce
  ;; - client -> gateway: private.sign(nonce) public key CID
  ;; - gateway.publish(CID, hash(publickey))
  )

;; TODO test me
(defn create-js!
  "Create an account from a JavaScript context."
  []
  ;; TODO convert args to edn
  (create!))
