(ns com.kubelt.spec.crypto
  "Defines a spec for crypto-related data."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.common :as spec.common]))


(def hex-64-string
  [:re (re-pattern (spec.common/hex-pattern 64))])

(def hex-128-string
  [:re (re-pattern (spec.common/hex-pattern 128))])

;; Digest
;; -----------------------------------------------------------------------------

(def digest-algorithm
  [:enum
   :digest.algorithm/sha2-256
   :digest.algorithm/sha3-256])

(def digest
  [:map
   [:com.kubelt/type [:enum :kubelt.type/crypto.digest]]
   [:digest/algorithm digest-algorithm]
   [:digest/byte-length spec.common/byte-length]
   [:digest/bit-length spec.common/bit-length]
   [:digest/bytes spec.common/byte-data]
   [:digest/hex-string hex-64-string]])

#_(def digest-spec
  [:and
   {:name "Digest"
    :description "A cryptographic digest."
    :example {:digest/algorithm :digest.algorithm/sha2-256
              :digest/byte-length 32
              :digest/bit-length 256
              :com.kubelt/type :kubelt.type/digest
              :digest/bytes [0 0 0]
              :digest/hex-string "c3ab...0c4f2"}}
   digest])

;; Seed
;; -----------------------------------------------------------------------------
;; Defines the schema for a crypto seed.

(def seed
  [:map
   [:com.kubelt/type [:enum :kubelt.type/crypto.seed]]
   [:digest/byte-length spec.common/byte-length]
   [:digest/bit-length spec.common/bit-length]
   [:digest/algorithm digest-algorithm]
   [:seed/hex-string hex-64-string]
   [:seed/bytes spec.common/byte-data]])

(def seed-schema
  [:and
   {:name "Seed"
    :description "A cryptographic seed."
    :example {:digest/algorithm :digest.algorithm/sha3-256
              :digest/byte-length 32
              :digest/bit-length 256
              :com.kubelt/type :kubelt.type/crypto.seed
              :seed/bytes []
              :seed/hex-string "092b17b0...b8c6bc5a"}}
   seed])

;; Keypair
;; -----------------------------------------------------------------------------
;; Defines the schema for a crypto keypair.

(def keypair-algorithm
  [:enum :keypair.algorithm/ed25519])

(def keypair-function
  [:enum :keypair.function/signing-key])

;; [CLJ] TODO org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
;; [CLJS] TODO FIXME
(def public-key
  [:map
   [:com.kubelt/type [:enum :kubelt.type/public-key]]
   [:key/data :any]])

;; [CLJ] TODO org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
;; [CLJS] TODO FIXME
(def secret-key
  [:map
   [:com.kubelt/type [:enum :kubelt.type/secret-key]]
   [:key/data :any]])

(def keypair
  [:map
   [:com.kubelt/type [:enum :kubelt.type/crypto.keypair]]
   [:keypair/algorithm keypair-algorithm]
   [:keypair/function keypair-function]
   [:keypair/public-length spec.common/byte-length]
   [:keypair/secret-length spec.common/byte-length]
   [:keypair/signature-length spec.common/byte-length]
   [:keypair/public-key public-key]
   [:keypair/secret-key secret-key]])

;; An RDF/cljs quad with some properties attached to the schema for
;; introspection.
(def keypair-schema
  [:and
   {:name "Keypair"
    :description "A cryptographic keypair."
    :example {:com.kubelt/type :kubelt.type/crypto.keypair
              :keypair/algorithm :keypair.algorithm/ed25519
              :keypair/function :keypair.function/signing-key
              :keypair/signature-length 64
              :keypair/public-length 32
              :keypair/secret-length 32
              :keypair/public-key :example/public-key
              :keypair/secret-key :example/secret-key}}
   keypair])

;; Signature
;; -----------------------------------------------------------------------------
;; Defines the schema for a crypto signature.

(def signature
  [:map
   [:com.kubelt/type [:enum :kubelt.type/crypto.signature]]
   [:signature/algorithm keypair-algorithm]
   [:signature/hex-string hex-128-string]
   [:signature/bytes spec.common/byte-data]
   [:signature/length spec.common/byte-length]])

(def signature-schema
  [:and
   {:name "Signature"
    :description "An ed25519 cryptographic signature."
    :example
    {:com.kubelt/type :kubelt.type/crypto.signature
     :signature/algorithm :keypair.algorithm/ed25519
     :signature/lengthx 64
     :signature/hex-string "3fea...e701"
     :signature/bytes [0 0 0]}}
   signature])
