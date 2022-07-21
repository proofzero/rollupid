(ns com.kubelt.spec.jwt
  "JSON Web Token and related definition."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.wallet :as spec.wallet]))

;; A JSON encrypted Web Token.
(def encrypted-jwt
  [:re
   (re-pattern "(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*$)")])

;; A JSON Web Token.
(def jwt
  [:map
   [:header [:map [:alg [:enum "ES256"]]]]
   [:claims [:map
             [:aud spec.wallet/wallet-address]
             [:iss spec.wallet/wallet-address]
             [:sub spec.wallet/wallet-address]
             [:json-rpc-url :string]
             [:iat number?]
             [:exp number?]]]
   [:token [:re (re-pattern "(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*)")]]
   [:signature :string]])
