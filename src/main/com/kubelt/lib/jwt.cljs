(ns com.kubelt.lib.jwt
  "Wrapper around jose JWT library."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["crypto" :as crypto])
  (:require
   ["jsonwebtoken" :as jwt]
   [taoensso.timbre :as log]
   ["jose" :as jose :refer [SignJWT]]))

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

#_{:jwt/algo :hs256
   :jwt/expiration "1h"
   :jwt/subject "bees"}

;; TODO test me
(defn sign-payload
  "Return a Compact JWS formatted JWT string."
  ;; options {:expires "1h" :alg "HS256"}
  [payload key-private options]
  (-> (SignJWT. payload)
      (.setProtectedHeader #js {"alg" (get options :alg)})
      ;;(.setIssuedAt)
      ;;(.setJti "xxx")
      ;;(.setIssuer "urn:example:issuer")
      ;;(.setAudience "urn:example:audience")
      (.setExpirationTime (get options :expires))
      ;;(.setNotBefore)
      ;;(.setSubject "")
      ;; Returns a promise that resolves to the JWT.
      (.sign key-private)))


(defn sign
  "Return a Compact JWS formatted JWT string."
  [payload]
  (let [;; Can supply buffer from symmetric encryption/HMAC, but need a
        ;; CryptoKey or KeyObject for PK encryption. Which algorithm is
        ;; employed is determined by {"alg": "..."}.
        key-like (js/Buffer.from "s3kre7")
        payload (clj->js payload)
        ;; NB: (doto x) returns x.
        sign-jwt (doto (SignJWT. payload)
                   (.setProtectedHeader #js {"alg" "HS256"})
                   ;;(.setIssuedAt)
                   ;;(.setJti "xxx")
                   ;;(.setIssuer "urn:example:issuer")
                   ;;(.setAudience "urn:example:audience")
                   (.setExpirationTime "1h")
                   ;;(.setNotBefore)
                   ;;(.setSubject "")
                   )]
    ;; Returns a promise that resolves to the JWT.
    (.sign sign-jwt key-like)))

(defn verify
  [token public-key]
  (let [tokenjs (clj->js token)
        public-keyjs (clj->js public-key)]
    (.verify jwt tokenjs public-keyjs)
    ))

#_(defn encode
    []
    ;; TODO
    )

(defn decode
  [token]
  (.decode jwt token)
  )
