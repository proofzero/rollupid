(ns com.kubelt.proto.wallet
  "A protocol for dealing with "
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})


(defprotocol Wallet
  ""
  ;; ethereum.request({ method: "eth_requestAccounts" });
  ;; -> returns a promise
  ;; -> resolves with an array of of hex-prefixed Ethereum addresses
  (unlock [this passphrase]
    "Unlock the wallet using the supplied passphrase.")

  (account [this id]
    "Return an account associated with the wallet.")

  (network [this id]
    "Get a network associated with the wallet.")

  ;; Add network
  ;; - network name
  ;; - rpc URL
  ;; - chain ID
  ;; - currency symbol (optional)
  ;; - block explorer URL (optional)
  )

(defprotocol Network
  ""
  ;; NB: available as ethereum.networkVersion().
  (version [this]
    "Returns the current network version."))

(defprotocol Account
  ""
  (name [this]
    "Return the human-readable name of the account.")

  ;; NB: available as ethereum.selectedAddress().
  (address [this]
    "Return the address of the account.")

  (sign [this data]
    "Sign some data using the keypair associated with an account."))
