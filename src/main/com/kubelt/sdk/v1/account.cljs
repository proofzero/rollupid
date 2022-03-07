(ns com.kubelt.sdk.v1.account
  "Account management."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :refer [promise]]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; authenticate!
;; -----------------------------------------------------------------------------
;; In a browser context, this keypair is managed by an external wallet
;; provider plugin, e.g. MetaMask. On other platforms, similar
;; functionality is provided via other means.

;; TODO check for valid sys map
;; TODO should this be combined with the (init) call?
;; TODO test me
(defn authenticate!
  "Create an account or authorize an existing account. User identity is
  centered around an ETH account and is also the name linked to the user's
  Kubelt application data (aka the 'me dag'). 
  
  A public key is requested from the wallet and must be provided as a
  hex-encoded string along with the account id. These two pieces of information 
  together kick off a zero-knowledge authentication request."
  [sys wallet]
  ;; TODO validate system map
  ;; TODO validate public-key
  ;; TODO validate wallet map
  (let [{:keys [wallet/sign-fn]} wallet
        message-to-sign "Foo"
        signed-message (sign-fn message-to-sign)]
    ;; Wallet is a collection of crypto fns that hide the private key
    ;; from SDK by closing over it, while enabling crypto operations
    ;; within the SDK.

    ;; a flow for validating keypair ownership:
    ;; - sdk -> p2p: send nonce for public key <key>
    ;; - p2p -> sdk: <encrypted nonce>
    ;; - sdk -> p2p: <decrypted, signed nonce>

    ;; - p2p: lookup(pub-key) => cid / nil
    ;;   - if cid, user's me-dag already exists; hurray
    ;;   - if nil, we have a new user; create p2p context
    ;;     - store public key?
    ;;     - store registration timestamp?
    ;;     - set up billing context?
    ;; - p2p -> sdk: JWT session (include me-dag root CID in body)
    ;; - sdk: if nil, create and store me-dag:
    ;;   - populate triple store with initial user account info
    ;;   - sdk -> ipfs: store(me-dag) => cid
    ;; - sdk -> p2p: update(jwt, me-dag cid)
    ;;   => refreshed JWT session token
    ;; <= return updated system map
    sys))

;; TODO test me
(defn authenticate-js!
  "Create an account from a JavaScript context."
  [sys wallet]
  (promise
   (fn [resolve reject]
     (let [wallet-map (lib.wallet/to-edn wallet)]
       (if (lib.error/error? wallet-map)
         (reject wallet-map)
         (resolve (authenticate! sys wallet-map)))))))

;; logged-in?
;; -----------------------------------------------------------------------------
;; A predicate that returns true when the user has successfully authenticated.

;; TODO check for valid sys map.
(defn logged-in?
  [sys]
  true)

(defn logged-in-js?
  [sys]
  (promise
   (fn [resolve reject]
     (resolve (logged-in? sys)))))
