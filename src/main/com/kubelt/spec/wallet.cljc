(ns com.kubelt.spec.wallet
  "Defines a spec for a wallet data structure representing the available
  cross-platform key management and crypto facilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.common :as spec.common]
   [com.kubelt.spec.core :as spec.core]
   [com.kubelt.spec.jwt :as spec.jwt])
  #?(:cljs (:require ["@ethersproject/wallet" :refer [Wallet]])))

(def ^:private wallet-mock-data
  "generated with/from ether (cljs) logic too (set (repeatedly 5 #(.-address (.createRandom Wallet))));;"
  #{"0x3E2C108FEE24bC552Ba98e3360A97d0912Cc0D63" "0x605b42fdBE0bbdaED4F0BA4158CD94F890292D5e" "0xE7187321fdb2A8E78aca4122586280571fa21D88" "0xd8e66F535061135643A3579Cc86BF7b860cb0e8A" "0xf46632c8a15d3f19ad9DF5568dE96891eaC48934"})

(defn hex-0x-pattern [length]
  (str "0[xX]" (spec.common/hex-pattern length)))

(defn hex-0x
  "string length +2 thus it's prefixed with 0x"
  [length]
  [:and
   [:re
    #?(:cljs {:gen/fmap (fn [_] (.-address (.createRandom Wallet)))}
       :clj {:gen/elements wallet-mock-data})
    (re-pattern (hex-0x-pattern length))]
   [:string {:max (+ 2 length) :min (+ 2 length)}]])

(def wallet-address (hex-0x 40))

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
   [:wallet/sign-fn sign-fn]])

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

;; Vault
;; -----------------------------------------------------------------------------
;; A vault is a collection of session tokens (JWTs) returned from
;; authentication calls.

(def vault
  [:map
   [:com.kubelt/type [:enum :kubelt.type/vault]]
   [:vault/tokens [:map-of spec.core/id spec.jwt/jwt]]])

(def vault-schema
  [:and
   {:name "vault"
    :description "A collection of session tokens"
    :example {:com.kubelt/type :kubelt.type/vault
              ;; TODO is this correct?
              :vault/tokens {"@acme" {:com.kubelt/type :kubelt.type/jwt
                                      ,,,}}}}
   vault])
