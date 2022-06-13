(ns com.kubelt.lib.jwk
  "JSON Web Key implementation"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; TODO NB! this is just an experiment that might be thrown out. Don't
;; rely on this for anything unless this warning is removed.

;; Public
;; -----------------------------------------------------------------------------

;; TODO move these to com.kubelt.lib.jwk

(defn- jwk-set
  "Return an object in JWK Set Format. This is a JSON object representing
  a set of JWKs."
  []
  {:keys []})

(defn- jwk-add
  "Add a JSON Web Key to a JWK Set of keys."
  [key-set key]
  (update key-set :keys conj key))

(defn- jwk-make-key
  [id]
  {:com.kubelt/type :kubelt.type/jwk
   :jwk/id id})

(defn- jwk-set-type
  "Sets the Key Type parameter. This value *must* be present in a JWK and
  must be registered in the IANA JSON Web Key types registry or be a
  value that contains a Collision-Resistant name."
  [jwk key-type]
  (assoc jwk :jwk/type key-type))

(defn- jwk-set-alg
  ""
  [jwk key-alg]
  (assoc jwk :jwk/algorithm key-alg))

(def key-use
  #{:enc
    :sig})

(defn- jwk-set-use
  "Sets the public key use parameter that conveys the intended use of the
  public key, i.e. for encrypting data of verifying the signature on
  data. The specification allows for the values 'sig' (signature) and
  'enc' (encryption), although other values may be used."
  [jwk key-use]
  (assoc jwk :jwk/use key-use))

(def key-ops
  #{;; compute digital signature or MAC
    :sign
    ;; verify digital signature or MAC
    :verify
    ;; encrypt content
    :encrypt
    ;; decrypt content and validate decryption, if applicable
    :decrypt
    ;; encrypt key
    :wrap-key
    ;; decrypt key and validate decryption, if applicable
    :unwrap-key
    ;; derive key
    :derive-key
    ;; derive bits not to be used as a key
    :derive-bits})

(defn- jwk-add-ops
  "Add a single key operation as a keyword to the collection of existing operations, or co"
  [jwk key-ops]
  (let [ops (get jwk :key/operations #{})
        ops (cond
              ;; given a single keyword as operation
              (keyword? key-ops)
              (conj ops key-ops)
              ;; given a vector of keywords as operation
              (and (vector? key-ops)
                   (every? keyword? key-ops))
              (cset/union ops (into #{} key-ops)))]
    (assoc jwk :jwk/operations ops)))

#?(:cljs
   (defn- jwk-as-obj
     [jwk]
     (letfn [(kw->str [kw]
               (name (csk/->camelCase kw)))]
       (let [key-id (get jwk :jwk/id)
             key-type (get jwk :jwk/type)
             key-use (kw->str (get jwk :jwk/use))
             key-alg (kw->str (get jwk :jwk/algorithm))
             key-ops (mapv kw->str (get jwk :jwk/operations))]
         (clj->js
          {:kid key-id
           :kty key-type
           :use key-use
           :alg key-alg
           :key_ops key-ops})))))

(defn- jwk-from-eth
  [eth-wallet]
  (let [jwk-pub {:fixme :public}
        jwk-sec {:fixme :secret}]
    [jwk-pub jwk-sec]))

;; Example JWK: Elliptic Curve DSS key used with P-256 elliptic curve,
;; with x and y coordinates are the base64url-encoded values shown. A
;; key identifier is also provided for the key.
;;
;; {"kty":"EC",
;;  "crv":"P-256",
;;  "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
;;  "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
;;  "kid":"Public key used in JWS spec Appendix A.3 example"}

;; Example public keys:
;;
;; {"keys":
;;   [
;;     {"kty":"EC",
;;      "crv":"P-256",
;;      "x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
;;      "y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
;;      "use":"enc",
;;      "kid":"1"},

;;     {"kty":"RSA",
;;      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx
;; 4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMs
;; tn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2
;; QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbI
;; SD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqb
;; w0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
;;      "e":"AQAB",
;;      "alg":"RS256",
;;      "kid":"2011-04-29"}
;;   ]
;; }

;; Example private keys:
;; {"keys":
;;    [
;;      {"kty":"EC",
;;       "crv":"P-256",
;;       "x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
;;       "y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
;;       "d":"870MB6gfuTJ4HtUnUvYMyJpr5eUZNP4Bk43bVdj3eAE",
;;       "use":"enc",
;;       "kid":"1"},

;;      {"kty":"RSA",
;;       "n":"0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4
;;  cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMst
;;  n64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2Q
;;  vzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbIS
;;  D08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw
;;  0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
;;       "e":"AQAB",
;;       "d":"X4cTteJY_gn4FYPsXB8rdXix5vwsg1FLN5E3EaG6RJoVH-HLLKD9
;;  M7dx5oo7GURknchnrRweUkC7hT5fJLM0WbFAKNLWY2vv7B6NqXSzUvxT0_YSfqij
;;  wp3RTzlBaCxWp4doFk5N2o8Gy_nHNKroADIkJ46pRUohsXywbReAdYaMwFs9tv8d
;;  _cPVY3i07a3t8MN6TNwm0dSawm9v47UiCl3Sk5ZiG7xojPLu4sbg1U2jx4IBTNBz
;;  nbJSzFHK66jT8bgkuqsk0GjskDJk19Z4qwjwbsnn4j2WBii3RL-Us2lGVkY8fkFz
;;  me1z0HbIkfz0Y6mqnOYtqc0X4jfcKoAC8Q",
;;       "p":"83i-7IvMGXoMXCskv73TKr8637FiO7Z27zv8oj6pbWUQyLPQBQxtPV
;;  nwD20R-60eTDmD2ujnMt5PoqMrm8RfmNhVWDtjjMmCMjOpSXicFHj7XOuVIYQyqV
;;  WlWEh6dN36GVZYk93N8Bc9vY41xy8B9RzzOGVQzXvNEvn7O0nVbfs",
;;       "q":"3dfOR9cuYq-0S-mkFLzgItgMEfFzB2q3hWehMuG0oCuqnb3vobLyum
;;  qjVZQO1dIrdwgTnCdpYzBcOfW5r370AFXjiWft_NGEiovonizhKpo9VVS78TzFgx
;;  kIdrecRezsZ-1kYd_s1qDbxtkDEgfAITAG9LUnADun4vIcb6yelxk",
;;       "dp":"G4sPXkc6Ya9y8oJW9_ILj4xuppu0lzi_H7VTkS8xj5SdX3coE0oim
;;  YwxIi2emTAue0UOa5dpgFGyBJ4c8tQ2VF402XRugKDTP8akYhFo5tAA77Qe_Nmtu
;;  YZc3C3m3I24G2GvR5sSDxUyAN2zq8Lfn9EUms6rY3Ob8YeiKkTiBj0",
;;       "dq":"s9lAH9fggBsoFR8Oac2R_E2gw282rT2kGOAhvIllETE1efrA6huUU
;;  vMfBcMpn8lqeW6vzznYY5SSQF7pMdC_agI3nG8Ibp1BUb0JUiraRNqUfLhcQb_d9
;;  GF4Dh7e74WbRsobRonujTYN1xCaP6TO61jvWrX-L18txXw494Q_cgk",
;;       "qi":"GyM_p6JrXySiz1toFgKbWV-JdI3jQ4ypu9rbMWx3rQJBfmt0FoYzg
;;  UIZEVFEcOqwemRN81zoDAaa-Bk0KWNGDjJHZDdDmFhW3AN7lI-puxk_mHZGJ11rx
;;  yR8O55XLSe3SPmRfKwZI6yU24ZxvQKFYItdldUKGzO6Ia6zTKhAVRU",
;;       "alg":"RS256",
;;       "kid":"2011-04-29"}
;;    ]
;;  }

;; Example symmetric keys:
;;
;; {"keys": [
;;      {"kty":"oct",
;;       "alg":"A128KW",
;;       "k":"GawgguFyGrWKav7AX4VKUg"},

;;      {"kty":"oct",
;;       "k":"AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75
;;  aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow",
;;       "kid":"HMAC key used in JWS spec Appendix A.1 example"}
;;    ]
;;  }
