(ns com.kubelt.lib.crypto
  "Cryptographic operations."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [java.security MessageDigest]
      [org.bouncycastle.util.encoders Hex]
      [org.bouncycastle.crypto.digests
       Blake3Digest
       KeccakDigest
       SHA256Digest
       ;;SHA384Digest
       ;;SHA512Digest
       SHA3Digest
       ;;SHAKEDigest
       ;;TigerDigest
       ;;WhirlpoolDigest
       ])
     :cljs
     (:import
      [goog.crypt Aes Arc4 Cbc Hmac Sha256]))
  (:require
   [com.kubelt.lib.base64 :as base64])
  #?(:cljs
     (:require
      ["@stablelib/ed25519" :as ed25519]
      [goog.array]
      [goog.crypt.hash32 :as hash32]
      [goog.crypt.pbkdf2 :as pbkdf2])))

;; crypto rsa-sha256 verify
;; crypto rsa-sha256 sign

#_(ns com.kubelt.lib.key.node
  "Implementation of key-related protocols for Node.js."
  ;; TODO this breaks compile web-test
  #_(:require
   ["crypto" :as crypto :refer [KeyObject]])
  (:require
   [com.kubelt.lib.util :as util]
   [com.kubelt.proto.key :as proto.key]))

;; TODO requiring "crypto" here breaks the web-test build. Implement in
;; a better way for cross-platform support.

;; SymmetricKey
;; -----------------------------------------------------------------------------

#_(defrecord SymmetricKey [^KeyObject key-obj]
  proto.key/SymmetricKey

  (key-size [this]
    (.-symmetricKeySize key-obj))

  (export [this format]
    ;; format must be :buffer or :jwk
    (if (contains? #{:buffer :jwk} format)
      (let [format-str (name format)
            options (clj->js  {:format format-str})]
        (.export key-obj options))
      ;; TODO return error when invalid format
      )))

;; data is <string>|<ArrayBuffer>|<Buffer>|<TypedArray>|<DataView>
#_(defn make-secret-key
  ([data]
   (let [key-obj (.createSecretKey crypto data)]
     (->SymmetricKey key-obj)))
  ([data encoding]
   (let [key-obj (.createSecretKey crypto data encoding)]
     (->SymmetricKey key-obj))))

;; AsymmetricKey
;; -----------------------------------------------------------------------------

#_(defrecord AsymmetricKey [^KeyObject key-obj]
  proto.key/AsymmetricKey

  (key-type [this]
    (let [key-type (.-asymmetricKeyType key-obj)]
      (keyword key-type)))

  (describe [this]
    (let [details (.-asymmetricKeyDetails key-obj)]
      (util/obj->clj details))))

#_(defn make-private-key
  "Make a private key from existing JWK key material."
  ([data]
   (let [options (clj->js {:key data
                           :format "jwk"
                           :encoding "utf8"})
         key-obj (.createPrivateKey crypto options)]
     (->AsymmetricKey key-obj)))
  ([data passphrase]
   (let [options (clj->js {:key data
                           :format "jwk"
                           :encoding "utf8"
                           :passphrase passphrase})
         key-obj (.createPrivateKey crypto options)]
     (->AsymmetricKey key-obj))))

#_(defn make-public-key
  "Make a public key from existing JWK key material."
  ([data]
   (let [options (clj->js {:key data
                           :format "jwk"
                           :encoding "utf8"})
         key-obj (.createPublicKey crypto options)]
     (->AsymmetricKey key-obj)))
  ([data passphrase]
   (let [options (clj->js {:key data
                           :format "jwk"
                           :encoding "utf8"
                           :passphrase passphrase})
         key-obj (.createPublicKey crypto options)]
     (->AsymmetricKey key-obj))))

;; KeyPair
;; -----------------------------------------------------------------------------

#_(defrecord KeyPair [^KeyObject priv-obj ^KeyObject pub-obj]
  proto.key/KeyPair

  (private [this]
    (->AsymmetricKey priv-obj))

  (public [this]
    (->AsymmetricKey pub-obj)))

#_(defn make-key-pair
  "Make a key pair from existing key material."
  [data]
    (let [options (clj->js {:key data
                            :format "pem"
                            :encoding "utf8"})
        private (.createPrivateKey crypto options)
        public (.createPublicKey crypto private)]
    (->KeyPair private public)))

#_(defn generate-key-pair
  "Generate a new key pair."
  []
  ;; TODO
  )

#_(defn aes-encrypt
  "Key must be an array of integers {0,255} having lengths 16, 24, or 32
  for 128-, 192-, or 256-bit encryption respectively. The input must be
  a block of length Aes.BLOCK_SIZE (16 bytes, as per the AES spec)."
  [key input]
  (let [aes (Aes. key)]
    (.encrypt aes input)))

#_(defn aes-decrypt
  [key input]
  (let [aes (Aes. key)]
    (.decrypt aes input)))

#_(defn block-encrypt
  "Encrypt data using Aes in CBC (cipher block-chaining) mode. Requires an
  initial vector of AES.BLOCK_SIZE (16 bytes)."
  [plain-text key iv]
  (let [aes (Aes. key)
        cbc (Cbc. aes)]
    (.encrypt cbc plain-text iv)))

#_(defn block-decrypt
  ""
  [cipher-text key iv]
  (let [aes (Aes. key)
        cbc (Cbc. aes)]
    (.decrypt cbc cipher-text iv)))

#_(defn hmac
  "Takes an Array<number> as the key to use and the message to hash. The
  message can be an Array<number>, Uint8Array, or string."
  [key message]
  (let [hasher (Sha256.)
        ;; Not providing opt_blockSize; either the block size from
        ;; hasher is used, or defaults to 16.
        mac (Hmac. hasher key)]
    (.getHmac mac message)))

#_(defn derive-key
  "Returns an Array<number>."
  [password salt iterations key-length]
  (pbkdf2/deriveKeySha1 password salt iterations key-length))

#_(defn do-eet
  []
  (let [password "foobar"
        salt "xyz"
        iterations 4
        key-length 64
        message "greetings from Mars"

        key (derive-key password salt iterations key-length)
        key' (sha256-sum key)
        mac (hmac key' message)

        aes-key-size 32
        ;; TODO prefer to look this up on const property BLOCK_SIZE of
        ;; Aes instance.
        aes-block-size 16

        aes-key (goog.array.repeat 1 aes-key-size)
        aes-block (goog.array.repeat 2 aes-block-size)
        ciphertext (aes-encrypt aes-key aes-block)

        ;; NB: plain text array must be a multiple of AES block size.
        plain-text (goog.array.repeat 5 (* 8 aes-block-size))
        initial-vector (goog.array.repeat 4 aes-block-size)
        ciphertext-cbc (block-encrypt plain-text aes-key initial-vector)
        ]
    (-> ciphertext
        (base64/encodeByteArray))))
