(ns com.kubelt.sdk.v1.oort
  "Account management."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.jwt :as lib.jwt]
   [com.kubelt.lib.oort :as lib.oort]
   [com.kubelt.lib.promise :as lib.promise :refer [promise]]
   [com.kubelt.lib.rpc :as lib.rpc]
   [com.kubelt.lib.vault :as lib.vault]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; authenticate!
;; -----------------------------------------------------------------------------
;; In a browser context, this keypair is managed by an external wallet
;; provider plugin, e.g. MetaMask. On other platforms, similar
;; functionality is provided via other means.

(defn authenticate&
  "Create an account or authorize an existing account. User identity is
  centered around an wallet accounts and is also the name linked to the
  user's Kubelt application data (via their private core).

  The public key from the wallet param must be available as a
  hex-encoded string along with the account id. These two pieces of
  information together kick off an authentication request.

  The signing function stored in the wallet is used to sign a nonce to
  complete the auth flow. Returns a promise that resolves to the updated
  system map containing the JWT for the system wallet core address, or
  is rejected with some information about the error that occurred."
  [sys]
  ;; TODO add an extra arity that allows a wallet to be passed in?
  ;; TODO validate system map (especially: ensure wallet is present)
  (let [core (get-in sys [:crypto/wallet :wallet/address])]
    (-> (lib.oort/authenticate! sys)
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
                 signature (sign-fn (:message nonce))]
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
               (lib.oort/verify! sys core (:nonce nonce) signature)
               (fn [verify-result]
                 (if (lib.error/error? verify-result)
                   ;; This triggers .catch handlers on returned promise.
                   (throw (ex-info "error" verify-result))
                   ;; We successfully retrieved a nonce, now verify it by signing
                   ;; it and sending it back.
                   (let [decoded-jwt (lib.jwt/decode verify-result)]
                     ;; TODO verify jwt
                     ;; TODO once we are able to inject a
                     ;; platform-specific storage capability, use that
                     ;; to allow the SDK state (or possibly just a
                     ;; subset, e.g. tokens) to be frozen and thawed
                     ;; back out
                     (-> sys
                         (assoc :crypto/session (lib.vault/vault {core decoded-jwt}))
                         (assoc-in [:crypto/session :vault/tokens*]  {core verify-result})))))))))))))

(defn authenticate-js!
  "Create an account from a JavaScript context."
  [sys core]
  (authenticate& sys))


;; TODO test me
(defn rpc-api [sys core]
  (lib.oort/rpc-api sys core))

(defn rpc-api-js [sys core]
  (rpc-api sys core))

(defn claims& [sys core]
  (lib.promise/promise
   (fn [resolve]
     (-> (rpc-api sys core)
         (lib.promise/then
          (fn [api]
            (-> (lib.rpc/rpc-call& sys api {:method [:kb :core :get :claims] :args []})
                (lib.promise/then #(resolve (-> % :http/body :result))))))))))


(defn claims-js [sys]
  (-> (claims& sys (get-in sys [:crypto/wallet :wallet/address]))
      (lib.promise/then clj->js)))



;; TODO test me
(defn call-rpc-method [sys core method args]
  (lib.oort/call-rpc-method sys core method args))

(defn call-rpc-api-js [sys core method args]
  (-> (call-rpc-method sys core method (js->clj args))
      (lib.promise/then clj->js)
      (lib.promise/catch clj->js)))

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
