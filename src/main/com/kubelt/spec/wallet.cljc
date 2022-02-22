(ns com.kubelt.spec.wallet
  "Defines a spec for a wallet data structure representing the available
  cross-platform key management and crypto facilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; Operations
;; -----------------------------------------------------------------------------

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
   [:wallet/sign-fn sign-fn]])

(def wallet-schema
  [:and
   {:name "wallet"
    :description "A crypto wallet"
    :example {:sign-fn '(fn [data] "<signature>")}}
   wallet])
