(ns com.kubelt.lib.crypto.keypair
  "Keypair."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  #?(:clj
     (:import
      [org.bouncycastle.crypto CryptoException Signer]
      [org.bouncycastle.crypto.params Ed25519PrivateKeyParameters Ed25519PublicKeyParameters]
      [org.bouncycastle.crypto.signers Ed25519Signer])
     :cljs
     (:require
      ["@stablelib/ed25519" :as ed25519]))
  (:require
   [com.kubelt.lib.crypto.hexify :as lib.hexify]
   [com.kubelt.lib.crypto.seed :as lib.seed]))


;; keypair->map
;; -----------------------------------------------------------------------------

#?(:clj
   (defn- keypair->map
     [keypair]
     {:pre [(map? keypair)]}
     (let [public-length Ed25519PublicKeyParameters/KEY_SIZE
           secret-length Ed25519PrivateKeyParameters/KEY_SIZE
           ;; TODO specify expected seed length
           ;;seed-length (.-SEED_LENGTH ed25519)
           signature-length Ed25519PrivateKeyParameters/SIGNATURE_SIZE]
       (merge keypair
              {:com.kubelt/type :kubelt.type/crypto.keypair
               :keypair/algorithm :keypair.algorithm/ed25519
               :keypair/function :keypair.function/signing-key
               ;;:keypair/seed-length seed-length
               :keypair/signature-length signature-length
               :keypair/public-length public-length
               :keypair/secret-length secret-length}))))

#?(:cljs
   (defn- keypair->map
     [keypair]
     (let [public-length (.-PUBLIC_KEY_LENGTH ed25519)
           secret-length (.-SECRET_KEY_LENGTH ed25519)
           seed-length (.-SEED_LENGTH ed25519)
           signature-length (.-SIGNATURE_LENGTH ed25519)]
       (merge keypair
              {:com.kubelt/type :kubelt.type/crypto.keypair
               :keypair/algorithm :keypair.algorithm/ed25519
               :keypair/function :keypair.function/signing-key
               :keypair/seed-length seed-length
               :keypair/signature-length signature-length
               :keypair/public-length public-length
               :keypair/secret-length secret-length}))))

;; make-keypair
;; -----------------------------------------------------------------------------

#?(:clj
   (defn- make-keypair
     "Returns a BouncyCastle Ed25519 KeyPair wrapped in a map."
     ([]
      (let [random-seed (lib.seed/random)]
        (make-keypair random-seed)))
     ([seed]
      (let [seed-bytes (get seed :seed/bytes)
            secret-key (Ed25519PrivateKeyParameters. seed-bytes)
            secret-key-map {:com.kubelt/type :kubelt.type/secret-key
                            :key/data secret-key}
            public-key (.generatePublicKey secret-key)
            public-key-map {:com.kubelt/type :kubelt.type/public-key
                            :key/data public-key}]
        {:keypair/public-key public-key-map
         :keypair/secret-key secret-key-map}))))

#?(:cljs
   (defn- make-keypair
     "Returns a @stablelib/ed25519.KeyPair wrapped in a map."
     ([]
      (let [keypair (.generateKeyPair ed25519)
            public-key (.-publicKey keypair)
            public-key-map {:com.kubelt/type :kubelt.type/public-key
                            :key/data public-key}
            secret-key (.-secretKey keypair)
            secret-key-map {:com.kubelt/type :kubelt.type/secret-key
                            :key/data secret-key}]
        {:keypair/public-key public-key-map
         :keypair/secret-key secret-key-map}))
     ([seed]
      (let [seed-bytes (get seed :seed/bytes)
            keypair (.generateKeyPairFromSeed ed25519 seed-bytes)
            public-key (.-publicKey keypair)
            public-key-map {:com.kubelt/type :kubelt.type/public-key
                            :key/data public-key}
            secret-key (.-secretKey keypair)
            secret-key-map {:com.kubelt/type :kubelt.type/secret-key
                            :key/data secret-key}]
        {:keypair/public-key public-key-map
         :keypair/secret-key secret-key-map}))))

#?(:clj
   (defn- make-signature
     [keypair data]
     (let [private-key (get-in keypair [:keypair/secret-key :key/data])
           data-offset 0
           data-length (alength data)
           ;; If not signing, we are verifying.
           for-signing? true
           signer (Ed25519Signer.)]
       (doto signer
         (.init for-signing? private-key)
         (.update data data-offset data-length))
       (.generateSignature signer)))

   :cljs
   (defn- make-signature
     [keypair data]
     (let [secret-key (get-in keypair [:keypair/secret-key :key/data])]
       (.sign ed25519 secret-key data))))

(defn- signature->map
  [keypair sig-bytes]
  (let [sig-algo (get keypair :keypair/algorithm)
        sig-length (get keypair :keypair/signature-length)
        hex-string (lib.hexify/hex-string sig-bytes)]
      {:com.kubelt/type :kubelt.type/crypto.signature
       :signature/algorithm sig-algo
       :signature/length sig-length
       :signature/hex-string hex-string
       :signature/bytes sig-bytes}))

#?(:clj
   (defn- verify-signature
     [keypair signature data]
     (let [public-key (get-in keypair [:keypair/public-key :key/data])
           sig-bytes (get signature :signature/bytes)
           data-offset 0
           data-length (alength data)
           ;; If not signing, we are verifying.
           for-signing? false
           verifier (Ed25519Signer.)]
       (doto verifier
         (.init for-signing? public-key)
         (.update data data-offset data-length))
       (.verifySignature verifier sig-bytes))))

#?(:cljs
   (defn- verify-signature
     [keypair signature data]
     (let [public-key (get-in keypair [:keypair/public-key :key/data])
           sig-bytes (get signature :signature/bytes)]
       (.verify ed25519 public-key data sig-bytes))))

;; Public
;; -----------------------------------------------------------------------------

;; The keypair creation functions return a @stablelib/ed25519.KeyPair.
;;
;; NB: (.generateKeyPair) takes an optional RandomSource. We may want
;; to support that in the future.
(defn generate
  "Generate a signing keypair. If no seed value is provided, a random one
  is used."
  ([]
   (let [keypair (make-keypair)]
     (keypair->map keypair)))
  ([seed]
   (let [keypair (make-keypair seed)]
     (keypair->map keypair))))

(defn sign
  "Sign some data, provided as a byte sequence, using the given
  keypair. Returns the signature as a byte sequence."
  [keypair data]
  ;; TODO validate the keypair
  ;; TODO validate the data is [B or Uint8Array (lib.octet/bytes?)
  (let [sig-bytes (make-signature keypair data)]
    (signature->map keypair sig-bytes)))

(defn verify
  "Verify the signature over some data. The keypair must have been
  generated using (generate). The data and signature are provided as
  byte sequences. The signature must have been generated by the (sign)
  function. Returns true if the signature is valid, false otherwise."
  [keypair signature data]
  ;; TODO validate the keypair
  ;; TODO validate the signature is kubelt.type/crypto.signature
  (verify-signature keypair signature data))
