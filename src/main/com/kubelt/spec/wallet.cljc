(ns com.kubelt.spec.wallet
  "Defines a spec for a wallet data structure representing the available
  cross-platform key management and crypto facilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.common :as spec.common]))


(defn- hex-0x-pattern [length]
  (str "0[xX]" (spec.common/hex-pattern length)))

(defn hex-0x
  "string length +2 thus it's prefixed with 0x"
  [length]
  [:and
   [:re
    (re-pattern (hex-0x-pattern length))]
   [:string {:max (+ 2 length) :min (+ 2 length)}]])

(def wallet-address
  (let [length 40]
    (hex-0x length)))

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
wallet."}
   [:cat :any] :string])

;; Wallet
;; -----------------------------------------------------------------------------
;; TODO define a derived wallet type; uses key material that we generate
;; internally (probably derived from external wallet key material), and
;; thus stores secret key materal as well.

(def wallet
  [:map
   [:com.kubelt/type [:enum :kubelt.type/wallet]]
   [:wallet/address wallet-address]
   ;;[:wallet/encrypt-key spec.crypto/public-key]
   ;;[:wallet/decrypt-fn decrypt-fn]
   [:wallet/sign-fn {:optional true} sign-fn]])

(def wallet-schema
  [:and
   {:name "wallet"
    :description "A crypto wallet"
    :example {:com.kubelt/type :kubelt.type/wallet
              :wallet/address "0x13235asdasf31312sadfasd"
              :wallet/encrypt-key {:com.kubelt/type :kubelt.type/public-key
                                   :key/data "<key data>"}
              :wallet/sign-fn '(fn [data] "<signature>")}}
   wallet])
