(ns com.kubelt.lib.key.node
  "Implementation of key-related protocols for Node.js."
  (:require
   ["crypto" :as crypto :refer [KeyObject]])
  (:require
   [com.kubelt.lib.util :as util]
   [com.kubelt.sdk.proto.key :as proto.key]))

;; SymmetricKey
;; -----------------------------------------------------------------------------

(defrecord SymmetricKey [^KeyObject key-obj]
  proto.key/SymmetricKey

  (key-size [this]
    (.-symmetricKeySize key-obj))

  (export [this format]
    ;; format must be :buffer or :jwk
    (if (contains? #{:buffer :jwk} format)
      (let [format-str (name format)
            options #js {:format format-str}]
        (.export key-obj options))
      ;; TODO return error when invalid format
      )))

;; data is <string>|<ArrayBuffer>|<Buffer>|<TypedArray>|<DataView>
(defn make-secret-key
  ([data]
   (let [key-obj (.createSecretKey crypto data)]
     (->SymmetricKey key-obj)))
  ([data encoding]
   (let [key-obj (.createSecretKey crypto data encoding)]
     (->SymmetricKey key-obj))))

;; AsymmetricKey
;; -----------------------------------------------------------------------------

(defrecord AsymmetricKey [^KeyObject key-obj]
  proto.key/AsymmetricKey

  (key-type [this]
    (let [key-type (.-asymmetricKeyType key-obj)]
      (keyword key-type)))

  (describe [this]
    (let [details (.-asymmetricKeyDetails key-obj)]
      (util/obj->clj details))))

(defn make-private-key
  "Make a private key from existing JWK key material."
  ([data]
   (let [options #js {:key data
                      :format "jwk"
                      :encoding "utf8"}
         key-obj (.createPrivateKey crypto options)]
     (->AsymmetricKey key-obj)))
  ([data passphrase]
   (let [options #js {:key data
                      :format "jwk"
                      :encoding "utf8"
                      :passphrase passphrase}
         key-obj (.createPrivateKey crypto options)]
     (->AsymmetricKey key-obj))))

(defn make-public-key
  "Make a public key from existing JWK key material."
  ([data]
   (let [options #js {:key data
                      :format "jwk"
                      :encoding "utf8"}
         key-obj (.createPublicKey crypto options)]
     (->AsymmetricKey key-obj)))
  ([data passphrase]
   (let [options #js {:key data
                      :format "jwk"
                      :encoding "utf8"
                      :passphrase passphrase}
         key-obj (.createPublicKey crypto options)]
     (->AsymmetricKey key-obj))))

;; KeyPair
;; -----------------------------------------------------------------------------

(defrecord KeyPair [^KeyObject priv-obj ^KeyObject pub-obj]
  proto.key/KeyPair

  (private [this]
    (->AsymmetricKey priv-obj))

  (public [this]
    (->AsymmetricKey pub-obj)))

(defn make-key-pair
  "Make a key pair from existing key material."
  [data]
  (let [options #js {:key data
                     :format "pem"
                     :encoding "utf8"}
        private (.createPrivateKey crypto options)
        public (.createPublicKey crypto private)]
    (->KeyPair private public)))

(defn generate-key-pair
  "Generate a new key pair."
  []
  ;; TODO
  )
