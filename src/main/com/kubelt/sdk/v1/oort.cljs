(ns com.kubelt.sdk.v1.oort
  "Account management."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [camel-snake-kebab.core :as csk]
   [camel-snake-kebab.extras :as cske]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.jwt :as lib.jwt]
   [com.kubelt.lib.oort :as lib.oort]
   [com.kubelt.lib.promise :as lib.promise :refer [promise]]
   [com.kubelt.lib.rpc :as lib.rpc]
   [com.kubelt.lib.vault :as lib.vault]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.spec.provider :as spec.provider]))

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
  [sys permissions network]
  ;; TODO validate system map (especially: ensure wallet is present)
  ;; TODO create conform& variant that returns a promise; current
  ;; conform* returns an error map if a guard check fails
  (lib.error/conform*
   [spec.provider/network network]
   (let [address (get-in sys [:crypto/wallet :wallet/address])]
     (log/debug {:log/msg "authenticating for address" :wallet/address address})
     (-> (lib.oort/authenticate& sys permissions network)
         ;; Check that we were able to successfully get a nonce to sign.
         (lib.promise/then
          (fn [auth-result]
            (if (lib.error/error? auth-result)
              ;; This triggers .catch handlers on returned promise.
              (throw (ex-info "error" auth-result))
              auth-result)))
         ;; We successfully retrieved a nonce, now verify it by signing
         ;; it and sending it back. The auth result has the form:
         ;; {:nonce "0x..." :message "Some human-readable stuff"}.
         (lib.promise/then
          (fn [{:keys [nonce message]}]
            (log/debug {:log/message "received nonce" :auth/nonce nonce :auth/message message})
            (let [sign-fn (get-in sys [:crypto/wallet :wallet/sign-fn])
                  signature& (sign-fn message)]
              [nonce signature&])))
         (lib.promise/then
          (fn [[nonce signature&]]
            ;; NB: the signature is expected to be a promise, even if
            ;; not strictly necessary on some platforms.
            (lib.promise/then
             signature&
             (fn [signature]
               (log/debug {:log/msg "signed nonce"
                           :wallet/address address
                           :auth/nonce nonce
                           :auth/signature signature})
               ;; If successful we get back a JWT that needs to be stored
               ;; in the system map. NB: the JWT has an expiry and encodes
               ;; client IP to restrict renewing JWTs for other clients.
               ;; TODO check/assert that this is true.
               (lib.promise/then
                (lib.oort/verify& sys address nonce signature)
                (fn [verify-result]
                  (if (lib.error/error? verify-result)
                    ;; This triggers .catch handlers on returned promise.
                    (throw (ex-info "error" verify-result))
                    ;; We successfully retrieved a nonce, now verify it by signing
                    ;; it and sending it back.
                    (let [decoded-jwt (lib.jwt/decode verify-result)]
                      ;; TODO verify jwt
                      (-> sys
                          ;; Store the chain specification (e.g. "eth", "5" for goerli)
                          ;; and send with successive calls.
                          (assoc :crypto/session (lib.vault/vault {address decoded-jwt}))
                          (assoc-in [:crypto/session :vault/tokens*] {address verify-result}))))))))))))))

(defn authenticate-js&
  "Create an account from a JavaScript context."
  [sys permissions network]
  (let [;; Requested permissons in the form {:scope ["permission"]}
        permissions (js->clj permissions)
        ;; Blockchain provider network.
        blockchain (goog.object/get network "blockchain" "")
        chain (goog.object/get network "chain" "")
        chain-id (goog.object/get network "chainId" 0)
        network {:network/blockchain blockchain
                 :network/chain chain
                 :network/chain-id chain-id}
        result (authenticate& sys permissions network)]
    (if (lib.error/error? result)
      (lib.promise/rejected result)
      result)))

;; RPC
;; -----------------------------------------------------------------------------
;; TODO replace this with our internal RPC client

;; TODO test me
(defn rpc-api
  [sys core]
  (lib.oort/rpc-api sys core))

(defn rpc-api-js
  [sys core]
  (rpc-api sys core))

;; TODO test me
(defn call-rpc&
  [sys core method params]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (rpc-api sys core)
         (lib.promise/then
          (let [args {:method method :params params}]
            (fn [api]
              (-> (lib.rpc/rpc-call& sys api args)
                  (lib.promise/then resolve)
                  (lib.promise/catch
                      (fn [e]
                        (reject
                         (lib.error/from-obj e))))))))))))

(defn call-rpc-js
  "entrypoint that uses sdk-rpc-client and sdk-rpc-api"
  ([sys args]
   (let [{:keys [method params]} (js->clj args :keywordize-keys true)
         core (-> sys :crypto/wallet :wallet/address)
         method (mapv keyword (js->clj method))]
     (-> (call-rpc& sys core method params)
         (lib.promise/then #(clj->js (cske/transform-keys csk/->camelCaseString %)))
         (lib.promise/catch clj->js))))

  ([sys method params]
   (let [method (mapv keyword (js->clj method))
         params (js->clj params :keywordize-keys true)
         core (-> sys :crypto/wallet :wallet/address)]
     (-> (call-rpc& sys core method params)
         (lib.promise/then #(clj->js (cske/transform-keys csk/->camelCaseString %)))
         (lib.promise/catch clj->js)))))

;; claims&
;; -----------------------------------------------------------------------------

(defn claims&
  "Get the claims associated with a core. The core is identified by a
  wallet address. Returns a promise the resolves to the collection of
  claims."
  [sys core]
  (let [;; Define the RPC call to perform.
        args {:method [:kb :get-core-claims] :args []}]
    (lib.promise/promise
     (fn [resolve reject]
       (-> (rpc-api sys core)
           (lib.promise/then
            (fn [api]
              (-> (lib.rpc/rpc-call& sys api args)
                  (lib.promise/then
                   (fn [x]
                     (if-let [error (-> x :http/body :error)]
                       (reject error)
                       (resolve (-> x :http/body :result)))))))))))))

(defn claims-js
  "Get the claims associated with a core from a JS context. Returns a
  promise that resolves to the collection of claims as JSON data."
  [sys]
  (let [core (get-in sys [:crypto/wallet :wallet/address])]
    (-> (claims& sys core)
        (lib.promise/then clj->js))))

;; logged-in?
;; -----------------------------------------------------------------------------
;; A predicate that returns true when the user has successfully authenticated.

;; TODO check for valid sys map.
(defn logged-in?
  [sys core]
  (if-let [token (get-in sys [:crypto/session :vault/tokens core])]
    ;; TODO general validation of the JWT using the current wallet, including expiry check.
    ;; Check that token hasn't expired.
    (let [expired? (lib.jwt/expired? token)
          logged-in (not expired?)]
      (log/debug #:v1.oort{:logged-in? logged-in})
      logged-in)
    ;; No stored JWT so not logged in.
    false))

(defn logged-in-js?
  [sys core]
  (promise
   (fn [resolve reject]
     (resolve (logged-in? sys core)))))

;; set-wallet
;; -----------------------------------------------------------------------------
;; TODO add & suffix

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
