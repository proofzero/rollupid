(ns com.kubelt.sdk.proto.key
  "Protocol for various types of keys."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

(defprotocol SymmetricKey
  "A symmetric key."
  (key-size [this]
    "Return the size of the key in bytes.")
  (export [this format]
    "Return an encoding of the key."))

(defprotocol AsymmetricKey
  "An asymmetric key."
  (key-type [this]
    "Return the key type as a keyword, e.g. :key.type/rsa.")
  (describe [this]
    "Returns a map describing various key attributes."))

(defprotocol KeyPair
  "A public/private key pair."
  (private [this]
    "Return the private key half of the key pair.")
  (public [this]
    "Return the public key half of the key pair."))
