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
    [goog.json :as json]
    [clojure.walk :as walk]
    [goog.crypt.base64 :refer [encodeString decodeString]]

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
(defn encode [target]
  (.encodeString base64 target goog.crypt.base64.BASE_64_URL_SAFE))

(defn decode [target]
  (.decodeString base64 target))

(defn fromBase64 [target]
  (doto target
    (.replace "/=/g" "")
    (.replace "/\\+/g" "-")
    (.replace "/\\//g" "_")))

 (defn create-header [alg exp]
   {:alg alg :exp exp})

;;  (str/join "" ["{\"alg\":\"" alg "\", \"exp\":\"" exp \""}"]))
(defn get-payload [token]
  (prn "enter get-payload")
  (let [dtoken (decode token)]
    (prn {:decoded-token token})
    (get dtoken :pubkey)))

(defn prepare-key [key-material] 
  ;; return key object
  key-material
  )
(defn prepare-payload [claims]
 claims
 )

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn sign-jwt [secret-key header-enc payload-enc] 
  (prn "enter sign-jwt")
  (let [
        b6header (decode header-enc)
        jheader (json/parse b6header)
        alg (.. jheader -alg)

       ;; header-dec (js->clj header)
       ;; algorithm (get header-dec :alg)
       ]
    (prn {:b6header b6header :jheader jheader})
    (prn {:alg alg})

;;  (prn {:header-enc header-enc :b6header b6header :bdheader bdheader :jheader jheader :header header :algorithm algorithm :header-dec header-dec})

  ;; sign payload+header
  (def signature-target (str/join "" [header-enc payload-enc]))
  

  ;; TODO: algorithm detection
  (if (not= (get header-enc :alg) "RS256") (prn "fixme: error"))

  (let [signer (.createSign crypto "RSA-SHA256")
        sig64 ( -> (.update signer payload-enc)
                 (.sign secret-key "base64"))
        signature-digest (fromBase64 sig64)]

    (encode signature-digest))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn create-jwt [secret-key header payload] 
  (let [
        header-enc (encode (json/serialize (clj->js header)))
        payload-enc (encode (json/serialize (clj->js payload)))
        
        signature-enc  (encode (sign-jwt secret-key header-enc payload-enc))]

    (str/join "." [header-enc payload-enc signature-enc])))


;;;; REF
#_(
   "encode to JWT"
   [payload key & [algo extra-headers]]
   (let [algo (or algo "HS256")
         extra-headers (or extra-headers {})
         signing-method (get signing-algorithm-map algo)
         signing-type (get  signing-type-map algo)]

     (if-not (map? payload)
       (throw (js/Error. "payload should be in JSON format")))

     (if-not (map? extra-headers)
       (throw (js/Error. "extra-headers should be a map")))

     (if-not (and signing-method signing-type)
       (throw (js/Error. "algorithm not supported")))

     (let [header (base64-url-encode (json/serialize (clj->js (apply conj extra-headers {:alg algo :typ "JWT"}))))
           payload (base64-url-encode (json/serialize (clj->js payload)))
           signature (sign (str header "." payload) key signing-method signing-type)]
       (str header "." payload "." signature))))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defn validate-jwt [token pubkey] 
  (prn "enter validate-jwt")
  (let [
        token-pieces (str/split token #"\.")
        pheader (get token-pieces 0)
        ppayload (decode (get token-pieces 1))
        psig (get token-pieces 2)
        verified (-> (.createVerify crypto "RSA-SHA256")
                     (.update (str/join "." [pheader ppayload]))
                     ;;(.verify pubkey, psig, "base64"))]
                     (.verify "asdlkjad", psig, "base64"))]
    ))

