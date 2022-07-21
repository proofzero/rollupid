(ns com.kubelt.spec.vault
  (:require
   [com.kubelt.spec.wallet :as spec.wallet]
   [com.kubelt.spec.jwt :as spec.jwt]))

;; Vault
;; -----------------------------------------------------------------------------
;; A vault is a collection of session tokens (JWTs) returned from
;; authentication calls.

(def vault-tokens [:map-of spec.wallet/wallet-address spec.jwt/jwt])
(def vault-tokens* [:map-of spec.wallet/wallet-address spec.jwt/encrypted-jwt])

(def vault
  [:map
   [:com.kubelt/type [:enum :kubelt.type/vault]]
   [:vault/tokens vault-tokens]
   [:vault/tokens* vault-tokens*]])

(def vault-schema
  [:and
   {:name "vault"
    :description "A collection of session tokens"
    :example {:com.kubelt/type :kubelt.type/vault
              ;; TODO is this correct?
              :vault/tokens {"@acme" {:com.kubelt/type :kubelt.type/jwt
                                      ,,,}}}}
   vault])
