(ns com.kubelt.sdk.v1.core
  "Account management."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.http.status :as http.status]
   [com.kubelt.lib.jwt :as lib.jwt]
   [com.kubelt.lib.p2p :as lib.p2p]
   [com.kubelt.lib.promise :as lib.promise :refer [promise]]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; authenticate!
;; -----------------------------------------------------------------------------
;; In a browser context, this keypair is managed by an external wallet
;; provider plugin, e.g. MetaMask. On other platforms, similar
;; functionality is provided via other means.

;; TODO test me
(defn authenticate!
  "Create an account or authorize an existing account. User identity is
  centered around an wallet accounts and is also the name linked to the
  user's Kubelt application data (aka the 'me dag').

  The public key from the wallet param must be available as a
  hex-encoded string along with the account id. These two pieces of
  information together kick off a zero-knowledge authentication request.

  The decryption function stored in the wallet will be used to decrypt a
  nonce to complete the proof. Returns a promise that resolves to the
  updated system map containing the JWT for the system wallet core address, or is
  rejected with some information about the error that occurred."
  [sys]
  ;; TODO add an extra arity that allows a wallet to be passed in?
  ;; TODO validate system map (especially: ensure wallet is present)

  ;; Send the public key and the account id to gateway
  ;; API "/@core/auth". This kicks off a zero-knowledge proof
  ;; authentication.
  (let [core (get-in sys [:crypto/wallet :wallet/address])]
    (-> (lib.p2p/authenticate! sys)
        (lib.promise/then
         (fn [auth-result]
           (if (lib.error/error? auth-result)
                  ;; This triggers .catch handlers on returned promise.
             (throw (ex-info "error" auth-result))
                  ;; We successfully retrieved a nonce, now verify it by signing
                  ;; it and sending it back.
             auth-result)))
        (lib.promise/then
         (fn [nonce]
           (let [sign-fn (get-in sys [:crypto/wallet :wallet/sign-fn])
                 signature (sign-fn nonce)]
             [nonce signature])))
        (lib.promise/then
         (fn [[nonce signature-p]]
                ;; NB: the signature is expected to be a promise, even if
                ;; not strictly necessary on some platforms.
           (lib.promise/then
            signature-p
            (fn [signature]
                   ;; If successful we get back a JWT that needs to be stored
                   ;; in the system map. NB: the JWT has an expiry and encodes
                   ;; client IP to restrict renewing JWTs for other clients.
                   ;; TODO check/assert that this is true.
              (lib.promise/then
               (lib.p2p/verify! sys core nonce signature)
               (fn [verify-result]
                 (if (lib.error/error? verify-result)
                        ;; This triggers .catch handlers on returned promise.
                   (throw (ex-info "error" verify-result))
                        ;; We successfully retrieved a nonce, now verify it by signing
                        ;; it and sending it back.
                   (let [decoded-jwt (lib.jwt/decode verify-result)]
                          ;; TODO verify jwt
                          ;; TODO once we are able to inject a
                          ;; platform-specific storage capability, use that to
                          ;; allow the SDK state (or possibly just a subset,
                          ;; e.g. tokens) to be frozen and thawed back out
                     (-> sys
                         (assoc-in [:crypto/session :vault/tokens core] decoded-jwt)
                         (assoc-in [:crypto/session :vault/tokens* core] verify-result)))))))))))))

;; TODO test me
(defn authenticate-js!
  "Create an account from a JavaScript context."
  [sys core]
  (authenticate! sys))


;; TODO test me
(defn rpc-api [sys core]
  (lib.p2p/rpc-api sys core))

(defn rpc-api-js [sys core]
  (rpc-api sys core))

;; TODO test me
(defn call-rpc-method [sys core method args]
  (lib.p2p/call-rpc-method sys core method args))

(defn call-rpc-api-js [sys core method args]
  (call-rpc-method sys core method args))


;; logged-in?
;; -----------------------------------------------------------------------------
;; A predicate that returns true when the user has successfully authenticated.

;; TODO check for valid sys map.
(defn logged-in?
  [sys core]
  (let [session-tokens (get-in sys [:crypto/session :vault/tokens])]
    ;; TODO validate the JWT using the current wallet
    (contains? session-tokens core)))

(defn logged-in-js?
  [sys core]
  (promise
   (fn [resolve reject]
     (resolve (logged-in? sys core)))))

;; set-wallet
;; -----------------------------------------------------------------------------

;; (defn set-wallet
;;   [sys wallet]
;;   (let [wallet-map (lib.wallet/to-edn wallet)]
;;        (if (lib.error/error? wallet-map)
;;          (reject wallet-map)
;;          (resolve (set-wallet sys wallet-map)))))

;; (defn set-wallet-js
;;   [sys wallet]
;;   (promise
;;    (fn [resolve reject]
;;      (if-not (lib.wallet/valid? wallet)
;;        (lib.wallet/explain wallet)
;;        (assoc sys :crypto/wallet wallet)))))

(defn set-wallet
  [sys wallet]
  (lib.promise/promise
   (fn [resolve reject]
     (if-not (lib.wallet/valid? wallet)
       (reject (lib.wallet/explain wallet))
       (let [sys' (assoc sys :crypto/wallet wallet)]
         (resolve sys'))))))

(defn set-wallet-js
  [sys wallet]
  (let [wallet-map (lib.wallet/to-edn wallet)]
    (set-wallet sys wallet-map)))
