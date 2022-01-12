(ns com.kubelt.sdk.impl.p2p
  "Wrapper around the external p2p naming system."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"})

(defn register!
  "Register an account, performing any initial setup that is required. The
  account is a map that contains the public key from the keypair that
  represents the user's account."
  [sys account]
  ;; TODO extract the p2p URI from the system map
  ;; (so we know where to send our HTTP request)

  ;; TODO extract the user's public key from the account map
  ;; (for use as an account identifier)

  ;; TODO make an HTTP request to p2p system, passing along the pub key
  ;; (expect a nonce in return, which should be signed and returned to
  ;; prove ownership of provided key and complete registration? to what
  ;; extent is this flow already defined by OAuth, JWT, etc.?)
  )

(defn store!
  "Store a key/value pair for the given user account."
  [sys account key value]
  ;; TODO extract the p2p URI from the system map
  ;; (so we know where to send our HTTP request)

  ;; TODO construct request body to store k/v pair
  ;; (we need a request body we can sign)

  ;; TODO sign request using user key pair
  ;; (attach a signature to the request that p2p node can use to
  ;; validate that the request came from the owner of the public key
  ;; that was used to register; prefer an existing web request signing
  ;; standard)

  ;; TODO make an HTTP POST request to p2p system to store k/v pair
  ;; (return success or failure? summary stats? something else?)
  )

(defn query!
  "Retrieve the value for a given key for a given user account."
  [sys account key]
  ;; TODO extract the p2p URI from the system map
  ;; (so we know where to send our HTTP request)

  ;; TODO extract user's public key from the account map
  ;; (for use as account identifier)

  ;; TODO make an HTTP GET request for the given key
  )
