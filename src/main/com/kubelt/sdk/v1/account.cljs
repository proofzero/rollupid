(ns com.kubelt.sdk.v1.account
  "Account management."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [cljs.core.async :as async :refer [<! go]])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.p2p :as lib.p2p]
   [com.kubelt.lib.promise :refer [promise]]
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

  The decryption function stored in the wallet will be used to decrypt
  a nonce to complete the proof"
  [sys core]
  ;; TODO add an extra arity that allows a wallet to be passed in?
  ;; TODO validate system map (especially: ensure wallet is present)
  ;; TODO validate core
  (go
    (let [;; Send the public key and the account id to gateway
          ;; API "/@core/auth". This kicks off a zero-knowledge proof
          ;; authentication.
          auth-result (<! (lib.p2p/authenticate! sys core))]
      (if (lib.error/error? auth-result)
        auth-result
        ;; We successfully retrieved a nonce, now verify it by signing
        ;; it and sending it back.
        (let [sign-fn (get-in sys [:crypto/wallet :wallet/sign-fn])
              nonce (get auth-result :nonce)
              signature (sign-fn nonce)
              verify-result (<! (lib.p2p/verify! sys core nonce signature))]
          (if (lib.error/error? verify-result)
            verify-result
            ;; If successful we get back a JWT that needs to be stored
            ;; in the system map. NB: the JWT has an expiry and encodes
            ;; client IP to restrict renewing JWTs for other clients.
            ;; TODO check/assert that this is true.
            (assoc-in sys [:crypto/session core] verify-result)))))))

;; TODO test me
(defn authenticate-js!
  "Create an account from a JavaScript context."
  [sys core]
  (promise
   (fn [resolve reject]
     (let [auth-chan (authenticate! sys core)]
       (async/take! auth-chan
        (fn [auth-result]
          (if (lib.error/error? auth-result)
            (reject auth-result)
            (resolve (authenticate! sys auth-result)))))))))

;; logged-in?
;; -----------------------------------------------------------------------------
;; A predicate that returns true when the user has successfully authenticated.

;; TODO check for valid sys map.
(defn logged-in?
  [sys core]
  (let [sessions (get sys :crypto/session)]
    ;; TODO validate the JWT using the current wallet
    (contains? sessions core)))

(defn logged-in-js?
  [sys core]
  (promise
   (fn [resolve reject]
     (resolve (logged-in? sys core)))))

;; set-wallet
;; -----------------------------------------------------------------------------

(defn set-wallet
  [sys wallet]
  (if-not (lib.wallet/valid? wallet)
    (lib.wallet/explain wallet)
    (assoc sys :crypto/wallet wallet)))

(defn set-wallet-js
  [sys wallet]
  (promise
   (fn [resolve reject]
     (let [wallet-map (lib.wallet/to-edn wallet)]
       (if (lib.error/error? wallet-map)
         (reject wallet-map)
         (resolve (set-wallet sys wallet-map)))))))
