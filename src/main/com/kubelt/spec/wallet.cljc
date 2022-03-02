(ns com.kubelt.spec.wallet
  "Defines a spec for a wallet data structure representing the available
  cross-platform key management and crypto facilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.spec.common :as spec.common]
   [com.kubelt.spec.crypto :as spec.crypto]))

(def wallet-address
  ;; TODO should be 0x<hex string>
  :string)

(def key-string
  ;; TODO hex string
  :string)

;; Operations
;; -----------------------------------------------------------------------------

(def decrypt-fn
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
;; TODO define a derived wallet type; uses key material that we generate
;; internally (probably derived from external wallet key material), and
;; thus stores secret key materal as well.

(def wallet
  [:map
   [:com.kubelt/type [:enum :kubelt.type/wallet]]
   [:wallet/address wallet-address]
   [:wallet/encrypt-key spec.crypto/public-key]
   [:wallet/decrypt-fn decrypt-fn]
   [:wallet/sign-fn sign-fn]])

(def wallet-schema
  [:and
   {:name "wallet"
    :description "A crypto wallet"
    :example {:com.kubelt/type :kubelt.type/wallet
              :wallet/address "0x13235asdasf31312sadfasd"
              :wallet/encrypt-key {:com.kubelt/type :kubelt.type/public-key
                                   ;; TODO
                                   }
              :wallet/sign-fn '(fn [data] "<signature>")}}
   wallet])

;; Vault
;; -----------------------------------------------------------------------------

(def vault
  [:map
   [:com.kubelt/type [:enum :kubelt.type/vault]]
   [:metamask/default {:optional true} wallet]
   [:metamask/polygon {:optional true} wallet]
   [:coinbase/default {:optional true} wallet]])

(def vault-schema
  [:and
   {:name "vault"
    :description "A wallet collection"
    :example {:com.kubelt/type :kubelt.type/vault
              :metamask/default {,,,}
              :metamask/polygon {,,,}
              :coinbase/default {,,,}}}
   vault])
