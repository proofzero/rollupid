(ns com.kubelt.lib.jwt
  "Wrapper around jose JWT library."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [cljs.core.async :as async :refer [chan go <! >!]]
    [cljs.core.async.interop :refer-macros [<p!]]
    [clojure.string :as str]
    [clojure.walk :as walk])
  (:require
    [goog.json :as json]
    [goog.crypt.base64 :refer [encodeString decodeString]]
    [taoensso.timbre :as log])
  #?(:node
     (:require
      ["crypto" :as crypto])))

;; - iss (issuer): Issuer of the JWT
;; - sub (subject): Subject of the JWT (the user)
;; - aud (audience): Recipient for which the JWT is intended
;; - exp (expiration time): Time after which the JWT expires
;; - nbf (not before time): Time before which the JWT must not be accepted
;;   for processing
;; - iat (issued at time): Time at which the JWT was issued; can be used
;;   to determine age of the JWT
;; - jti (JWT ID): Unique identifier; can be used to prevent the JWT from
;;   being replayed (allows a token to be used only once)

;; Public
;; -----------------------------------------------------------------------------
;; TODO wallet implementation should generate keys, wrapping:
;; - [browser] https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey
;; - [node] https://nodejs.org/api/crypto.html#crypto_class_keyobject
;; - symmetric keys
;;   - [browser] Uint8Array
;;   - [node] Buffer
;;
;; TODO local implementation
;; TODO change signature as (sign payload key algorithm type)
;; TODO spec for JWT + validation

;;;;;;;;;; helpers ;;;;;;;;;;;;;;;;;;;
(defn encode [target]
  "Encode a string with base64 URL Safe"
  (.encodeString base64 target goog.crypt.base64.BASE_64_URL_SAFE))

(defn decode [target]
  "Decode a string with base64 URL Safe"
  (.decodeString base64 target))

#_(defn fromBase64 [target]
  (doto target
    (.replace "/=/g" "")
    (.replace "/\\+/g" "-")
    (.replace "/\\//g" "_")))

(defn create-header [alg exp]
  "Create a JWT header specifying the algorithm used and expiry time"
  {:alg alg :exp exp})

(defn get-public-key [token]
  "Extract public key from the JWT payload"
  (let [payload-part (decode (get (str/split token #"\.") 1))
        payload-json (str/replace payload-part "\"" "")
        payload-map (js->clj (json/parse (decode (js->clj payload-json))) :keywordize-keys true)
        ]
    (decode (get payload-map :pubkey))))

(defn prepare-key [key-material]
  "import raw private key string"
  ;; return key object
  key-material)

(defn prepare-payload [claims]
  "import raw private key string"
  (encode (json/serialize (clj->js claims))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn- sign-jwt [alg secret-key header-enc payload-enc]
  "Sign encoded payload and header using secret key, return digest"
  ;; sign payload+header
  (def signature-target (str/join "" [header-enc payload-enc]))
  (let [signature-digest (-> (.createSign crypto "RSA-SHA256")
                             (.update (str/join "." [header-enc payload-enc]))
                             (.sign secret-key "base64"))]
    signature-digest))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn create-jwt [secret-key header payload]
  "Create a JWT token from key, header and payload"
  (let [
        alg (get header :alg)
        header-enc (encode (json/serialize (clj->js header)))
        payload-enc (encode (json/serialize (clj->js payload)))

        signature-enc  (encode (sign-jwt alg secret-key header-enc payload-enc))]

    (str/join "." [header-enc payload-enc signature-enc])))

  ;; TODO this can probably extract the pubkey internally
(defn validate-jwt [token]
  "Validate a token against a given public key"
  (let [
        ;; extract public key
        pubkey (get-public-key token)
        token-pieces (str/split token #"\.")
        psig (get token-pieces 2)
        verified (-> (.createVerify crypto "RSA-SHA256")
                     (.update (str/join "." [(get token-pieces 0) (get token-pieces 1)]))
                     ;;(.verify pubkey, psig, "base64"))]
                     (.verify pubkey (decode psig) "base64"))]
    verified))
