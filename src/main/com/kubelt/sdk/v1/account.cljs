(ns com.kubelt.sdk.v1.account
  "Account management."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.promise :refer [promise]]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; register!
;; -----------------------------------------------------------------------------
;; TODO use DNSSEC? cryptosig in TXT record? etc. to prove ownership....(?)
;;
;; GATEWAY (is HTTP gateway separate from p2p??)
;; TODO pre-fetching?
;; TODO http redirect to an IPFS gateway?
;; TODO http caching proxy?

;; Associate a user's public key with a name that can be used to look
;; up records via CNAME
;; - sdk -> p2p: send public key, (send name if provided)
;; - p2p: lookup(pub-key) => user / nil
;;   - if user record exists:
;;     - if name provided:
;;       - if user record already has associated name, done
;;       - if user record does not have requested name:
;;         - associate user record with name, done
;;   - else:
;;     - set up user context:
;;       - store public key
;;       - store registration timestamp?
;;       - set up billing context?
;;       - if name provided:
;;         - associate name with user record
(defn register!
  ([sys pub-key]
   sys)
  ([sys pub-key options]
   ;; TODO add p2p option:
   ;; - key-name: arbitrary human-readable string
   ;; - canonical-name: attempt to validate as cname?
   ;; - wallet address? etc.
   ;; NB: potentially multiple (many!) types of names associated with
   ;; user record (public key)
   sys))

(defn register-js!
  [sys pub-key name]
  ;; TODO transform args to edn
  (register! sys pub-key name))

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
  centered around an external PKI keypair. The public key of this root
  keypair is effectively the user's identity and is linked to their
  Kubelt application data. The public key must be provided as a
  hex-encoded string. A callback must also be supplied that is able to
  decrypt ciphertext using the private key of the root keypair. This
  capability is used to confirm ownership of the private key associated
  with the given public key. The callback will be passed an encrypted
  nonce and must return the corresponding plaintext."
  [sys wallet]
  ;; TODO validate system map
  ;; TODO validate public-key
  ;; TODO validate wallet map
  (let [{:keys [sign-fn]} wallet]
    ;; Wallet is a collection of crypto fns that hide the private key
    ;; from SDK by closing over it, while enabling crypto operations
    ;; within the SDK.
    )

  ;; a flow for validating keypair ownership:
  ;; - sdk -> p2p: send nonce for public key <key>
  ;; - p2p -> sdk: <encrypted nonce>
  ;; - sdk -> p2p: <decrypted, signed nonce>
  (let
   [messageToSign "Foo"]
    (let
     [signedMessage ((:wallet/sign-fn wallet) messageToSign)]
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
      sys)))

;; TODO test me
(defn authenticate-js!
  "Create an account from a JavaScript context."
  [sys wallet]
  (promise
   (fn [resolve reject]
     (let [walletMap (lib.wallet/to-edn wallet)]
       (if (lib.error/error? walletMap)
         (reject walletMap)
         (resolve (authenticate! sys walletMap)))))))

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
