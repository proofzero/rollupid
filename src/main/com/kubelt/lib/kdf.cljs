(ns com.kubelt.lib.kdf
  "Key derivation prototyping. The functions are only examples of calling
  Closure crypto functions. They should be fleshed out before using in
  anger."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:import
   [goog.crypt Aes Arc4 Cbc Hmac Sha256])
  (:require
   [goog.array]
   [goog.crypt.hash32 :as hash32]
   [goog.crypt.base64 :as base64]
   [goog.crypt.pbkdf2 :as pbkdf2]))

(defn aes-encrypt
  "Key must be an array of integers {0,255} having lengths 16, 24, or 32
  for 128-, 192-, or 256-bit encryption respectively. The input must be
  a block of length Aes.BLOCK_SIZE (16 bytes, as per the AES spec)."
  [key input]
  (let [aes (Aes. key)]
    (.encrypt aes input)))

(defn aes-decrypt
  [key input]
  (let [aes (Aes. key)]
    (.decrypt aes input)))

(defn block-encrypt
  "Encrypt data using Aes in CBC (cipher block-chaining) mode. Requires an
  initial vector of AES.BLOCK_SIZE (16 bytes)."
  [plain-text key iv]
  (let [aes (Aes. key)
        cbc (Cbc. aes)]
    (.encrypt cbc plain-text iv)))

(defn block-decrypt
  ""
  [cipher-text key iv]
  (let [aes (Aes. key)
        cbc (Cbc. aes)]
    (.decrypt cbc cipher-text iv)))

(defn sha256-sum
  [b]
  (let [hasher (Sha256.)]
    (.update hasher b)
    (.digest hasher)))

(defn hmac
  "Takes an Array<number> as the key to use and the message to hash. The
  message can be an Array<number>, Uint8Array, or string."
  [key message]
  (let [hasher (Sha256.)
        ;; Not providing opt_blockSize; either the block size from
        ;; hasher is used, or defaults to 16.
        mac (Hmac. hasher key)]
    (.getHmac mac message)))

(defn derive-key
  "Returns an Array<number>."
  [password salt iterations key-length]
  (pbkdf2/deriveKeySha1 password salt iterations key-length))

(defn do-eet
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
