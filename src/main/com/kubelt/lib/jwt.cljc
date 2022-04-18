(ns com.kubelt.lib.jwt
  "Wrapper around jose JWT library."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.lib.base64 :as lib.base64]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.jwt.check :as lib.jwt.check]
   [com.kubelt.lib.time :as lib.time]
   [com.kubelt.spec.jwt :as spec.jwt]))

;; TODO wallet implementation should generate keys, wrapping:
;; - [browser] https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey
;; - [node] https://nodejs.org/api/crypto.html#crypto_class_keyobject
;; - symmetric keys
;;   - [browser] Uint8Array
;;   - [node] Buffer
;;
;; TODO change signature as (sign payload key algorithm type)
;; TODO spec for JWT + validation

(comment
  (def ex-jwt
    {:header {:typ "JWT"
              ;; ECDSA using P-256 curve and SHA-256 hash algorithm
              :alg "ES256"}
     :claims {:iss "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
              :sub "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
              :aud "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
              :iat 1649880757
              :exp 1678894358383}
     :token "eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiIweEY0RTlBMzZkNEQzN0IxRjgzNzA2YzU4ZUY4ZTNBRjU1OUY0YzFFMkUiLCJzdWIiOiIweEY0RTlBMzZkNEQzN0IxRjgzNzA2YzU4ZUY4ZTNBRjU1OUY0YzFFMkUiLCJhdWQiOiIweEY0RTlBMzZkNEQzN0IxRjgzNzA2YzU4ZUY4ZTNBRjU1OUY0YzFFMkUiLCJpYXQiOjE2NDk4ODA3NTcsImV4cCI6MTY0OTg4NDM1NzM4M30"
     :signature "D2elS8jdiFQp2KZn_qg8dO0ZE_JV403MX9ZfButZIkRoZ7rQkcVDNWS8Vl-bU_j7JH-2sNGw--xJtfKF0QZ-jg"})
  )

;; Right now this is the only algorithm we support.
(def ^:private algorithms
  ["ES256"])

;; Maximum allowed age for the JWT in seconds.
;; - this is a bit over 11 days.
(def ^:private max-age
  1000000)

;; Amount of clock drift (in seconds) that we tolerate when checking
;; certain timestamps, e.g. token issue time.
(def ^:private tolerance
  10)

;; jwt-string?
;; -----------------------------------------------------------------------------

(defn jwt-string?
  "Return true if given a JWT encoded as a string, false otherwise."
  [x]
  ;; TODO check against malli spec
  (string? x))

;; jwt-map?
;; -----------------------------------------------------------------------------

(defn jwt-map?
  "Return true if given a JWT decoded as a map, false otherwise."
  [x]
  ;; TODO Check against malli spec
  (map? x))

;; jwt?
;; -----------------------------------------------------------------------------

(defn jwt?
  "Return true if given a JWT as either a string or a decoded map, and
  false otherwise."
  [x]
  (or (jwt-string? x)
      (jwt-map? x)))

;; key?
;; -----------------------------------------------------------------------------

(defn key?
  ""
  [x]
  ;; TODO check against malli spec
  (string? x))

;; decode
;; -----------------------------------------------------------------------------

(defn decode
  "Decode a JWT."
  [token]
  (letfn [(decode-part [part]
            (let [keywordize? true]
              (-> part
                  lib.base64/decode-string
                  (lib.json/from-json keywordize?))))]
    (if-not (string? token)
      (lib.error/error "token is not a string")
      (let [[header claims signature] (cstr/split token #"\.")
            token (str header "." claims)
            header (decode-part header)
            claims (decode-part claims)]
        {:header header
         :claims claims
         :token token
         :signature signature}))))

;; verify
;; -----------------------------------------------------------------------------

(defn verify
  "Verify a JWT."
  ([token key]
   (let [defaults {}]
     (verify token key defaults)))

  ([token key options]
   (lib.error/conform*
    [spec.jwt/token token]
    [spec.jwt/key key]
    [spec.jwt/options options]
    (let [;; Note that the JWT may be provided as either a string or a
          ;; map. If a string, it should be decoded into a map.
          token-map (if (string? token) (decode token) token)
          ;; Current timestamp, used as reference for time-based checks
          ;; unless a specific timestamp value to use is provided as an
          ;; option. NB: JWT specifies NumericDate for timestamps,
          ;; i.e. unix time (seconds since epoch).
          now (lib.time/unix-time)
          ;; The default set of options determine what the minimum set
          ;; of verification checks to perform are.
          defaults {:jwt/algorithms algorithms
                    :jwt/max-age max-age
                    :jwt/tolerance tolerance
                    :jwt/timestamp now}
          options (merge defaults options)]
      (lib.jwt.check/token token-map key options)))))
