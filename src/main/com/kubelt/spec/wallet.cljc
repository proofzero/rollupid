(ns com.kubelt.spec.wallet
  "Defines a spec for a wallet data structure representing the available
  cross-platform key management and crypto facilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Operations
;; -----------------------------------------------------------------------------

(def decryption-fn
  [:=> {:description "A decryption function that takes some encrypted data
returns a decrypted version of the data using the public key assoicated 
with the wallet." }
   [:cat :any :string]])

(def sign-fn
  [:=> {:description "A signing function that takes some data and
returns a signature generated using the private key associated with the
wallet." }
   [:cat :any :string]])

;; Wallet
;; -----------------------------------------------------------------------------

(def wallet
  [:map
   [:com.kubelt/type [:enum :kubelt.type/wallet]]
   [:wallet/account-id :string]
   [:wallet/public-key :bytes]
   [:wallet/decryption-fn decryption-fn]
   [:wallet/sign-fn sign-fn]])

(def wallet-schema
  [:and
   {:name "wallet"
    :description "A crypto wallet"
    :example {:sign-fn '(fn [data] "<signature>")}}
   wallet])
