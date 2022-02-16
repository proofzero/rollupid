(ns com.kubelt.lib.jwt
  "Wrapper around jose JWT library."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [cljs.core.async :as async :refer [chan go <! >!]]
    [cljs.core.async.interop :refer-macros [<p!]]
    ["crypto" :as crypto]
    [taoensso.timbre :as log]
    [clojure.string :as str]
    ["jose" :as jose :refer [SignJWT GetKeyFunction ]]))

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
(defn create-header [alg exp]
  [:alg alg :exp exp])

(defn prepare-key [key-material] 
  ;; return key object
  (key-material)
  )
(defn prepare-payload [claims]

  (claims)
  )

(defn encode [target]
  (.encodeString base64 target goog.crypt.base64.BASE_64_URL_SAFE))

(defn decode [target]
  (.decodeString base64 target))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn sign-jwt [secret-key header payload] 

  ;; base64url encode header
  (def header-enc (encode header))
  ;; base64url encode payload
  (def payload-enc (encode payload))

  ;; sign payload+header
  (def signature-target (str/join "" [header payload]))
  (def signature-digest "fixme")
  

  (def signature-enc (encode signature-digest))

  (str/join "." [header-enc payload-enc signature-enc]))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn create-jwt [secret-key header claims] 

  (def payload {:fixmelol "fixme"}) ;; TODO convert claims to payload

  (sign-jwt secret-key header payload))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn validate-jwt [token] 

  (def claims "fixme")
  (def header (create-header "RS256" "1h"))

  (def token-pieces (str/split "." token))
  (prn token-pieces)

  ;; return [:header :payload :signature]

  ) 

