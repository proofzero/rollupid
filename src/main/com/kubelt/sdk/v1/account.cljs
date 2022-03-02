(ns com.kubelt.sdk.v1.account
  "Account management."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
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

;; TODO check for valid sys map
;; TODO should this be combined with the (init) call?
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
  [sys wallet]
  ;; TODO validate system map
  ;; TODO validate public-key
  ;; TODO validate wallet map
  (let [{:keys [wallet/sign-fn]} wallet]

    ;; Send the public key and the account id to kubelt api "/auth"
    ;; This kicks off a zero-knowledge proof authentication

    ;; kubelt api returns an encrypted nonce created using the public key
    ;; decrypt this nonce and send the result back to the api

    ;; receive a JWT and store in system map
    ;; the JWT has an expiry and encodes client IP
    ;; to restrict renewing JWTs for other clients

    ;; TODO add authenticate! call to lib.p2p?
    ;; TODO store public key in wallet as :wallet/public-key
    ;; TODO change register! to pull out public key from :wallet/public-key
    #_(lib.p2p/register! sys wallet)

    ;; TODO add authenticate! call to lib.p2p?
    ;; TODO store public key in wallet as :wallet/public-key
    ;; TODO change register! to pull out public key from :wallet/public-key
    (lib.p2p/register! sys wallet)

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
