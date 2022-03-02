(ns com.kubelt.lib.crypto.keypair
  "Keypair."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #?(:clj
     (:import
      [org.bouncycastle.crypto
       CryptoException
       Signer]
      [org.bouncycastle.crypto.params
       Ed25519PrivateKeyParameters
       Ed25519PublicKeyParameters]
      [org.bouncycastle.crypto.signers Ed25519Signer])
     :cljs
     (:require
      ["@stablelib/ed25519" :as ed25519]
      [goog.array]))
  (:require
   [com.kubelt.lib.crypto.seed :as lib.seed]))

 ;; // Test case defined in https://www.rfc-editor.org/rfc/rfc8037
 ;;        var msg = "eyJhbGciOiJFZERTQSJ9.RXhhbXBsZSBvZiBFZDI1NTE5IHNpZ25pbmc".getBytes(StandardCharsets.UTF_8);
 ;;        var expectedSig = "hgyY0il_MGCjP0JzlnLWG1PPOt7-09PGcvMg3AIbQR6dWbhijcNR4ki4iylGjg5BhVsPt9g7sVvpAr_MuM0KAg";

 ;;        var privateKeyBytes = Base64.getUrlDecoder().decode("nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A");
 ;;        var publicKeyBytes = Base64.getUrlDecoder().decode("11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo");

 ;;        var privateKey = new Ed25519PrivateKeyParameters(privateKeyBytes, 0);
 ;;        var publicKey = new Ed25519PublicKeyParameters(publicKeyBytes, 0);

#?(:clj
   (defn- keypair->map
     [keypair]
     {:pre [(map? keypair)]}
     (let [public-length Ed25519PublicKeyParameters/KEY_SIZE
           secret-length Ed25519PrivateKeyParameters/KEY_SIZE
           ;;seed-length (.-SEED_LENGTH ed25519)
           signature-length Ed25519PrivateKeyParameters/SIGNATURE_SIZE]
       (merge keypair
              {:com.kubelt/type :kubelt.type/keypair
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
              {:keypair/algorithm :keypair.algorithm/ed25519
               :keypair/function :keypair.function/signing-key
               :keypair/seed-length seed-length
               :keypair/signature-length signature-length
               :keypair/public-length public-length
               :keypair/secret-length secret-length}))))

;; make-keypair

#?(:clj
   (defn make-keypair
     ([]
      (let [random-seed (lib.seed/random)]
        (make-keypair random-seed)))
     ([seed]
      (let [secret-bytes (get seed :seed/bytes)
            secret-key (Ed25519PrivateKeyParameters. secret-bytes)
            public-key (.generatePublicKey secret-key)]
        {:keypair/public-key public-key
         :keypair/secret-key secret-key}))))

#?(:cljs
   (defn make-keypair
     ([]
      (let [keypair (.generateKeyPair ed25519)
            public-key (.publicKey keypair)
            secret-key (.secretKey keypair)]
        {:keypair/public-key public-key
         :keypair/secret-key secret-key}))
     ([seed]
      (let [keypair (.generateKeyPairFromSeed ed25519 seed)
            public-key (.publicKey keypair)
            secret-key (.secretKey keypair)]
        {:keypair/public-key public-key
         :keypair/secret-key secret-key}))))

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
   (let [;; Returns a @stablelib/ed25519.KeyPair
         keypair (make-keypair)]
     (keypair->map keypair)))
  ([seed]
   ;; TODO seed must be a Uint8Array, length 32 bytes. We will have a
   ;; separate seed "type".
   (let [keypair (make-keypair seed)]
     (keypair->map keypair))))

(defn sign
  ""
  [keypair data]
  ;; Signer signer = new Ed25519Signer();
  ;; signer.init(true, privateKey);
  ;; signer.update(msg, 0, msg.length);
  ;; byte[] signature = signer.generateSignature();
  )

(defn verify
  ""
  [keypair data signature]
  ;; Signer signer = new Ed25519Signer();
  ;; signer.init(true, privateKey);
  ;; signer.verifySignature(byte[] signature);
  )
