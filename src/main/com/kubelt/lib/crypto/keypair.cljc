(ns com.kubelt.lib.crypto.keypair
  "Keypair."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:cljs
     (:require
      ["@stablelib/ed25519" :as ed25519]
      [goog.array]
      [goog.crypt.hash32 :as hash32]
      [goog.crypt.pbkdf2 :as pbkdf2])))


(defn- keypair->map
  [keypair]
  (let [public-length (.-PUBLIC_KEY_LENGTH ed25519)
        secret-length (.-SECRET_KEY_LENGTH ed25519)
        seed-length (.-SEED_LENGTH ed25519)
        signature-length (.-SIGNATURE_LENGTH ed25519)
        public-key (.publicKey keypair)
        secret-key (.secretKey keypair)]
    {:com.kubelt/type :kubelt.type/keypair
     :keypair/algorithm :keypair.algorithm/ed25519
     :keypair/function :keypair.function/signing-key
     :keypair/seed-length seed-length
     :keypair/signature-length signature-length
     :keypair/public-length public-length
     :keypair/secret-length secret-length
     :keypair/public-key public-key
     :keypair/secret-key secret-key}))

;; Public
;; -----------------------------------------------------------------------------
;; TODO #?(:cljs :clj)

;; The keypair creation functions return a @stablelib/ed25519.KeyPair.
;;
;; NB: (.generateKeyPair) takes an optional RandomSource. We may want
;; to support that in the future.
(defn generate
  "Generate a signing keypair. If no seed value is provided, a random one
  is used."
  ([]
   (let [;; Returns a @stablelib/ed25519.KeyPair
         keypair (.generateKeyPair ed25519)]
     (keypair->map keypair)))
  ([seed]
   ;; TODO seed must be a Uint8Array, length 32 bytes. We will have a
   ;; separate seed "type".
   (let [keypair (.generateKeyPairFromSeed ed25519 seed)]
     (keypair->map keypair))))

(defn sign
  ""
  [keypair data]
  )

(defn verify
  ""
  [keypair data signature]
  )
