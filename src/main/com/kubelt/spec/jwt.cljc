(ns com.kubelt.spec.jwt
  "JSON Web Token and related definition."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [key])
  (:require
   [com.kubelt.spec.wallet :as spec.wallet]))

;; A JSON encrypted Web Token.
(def encrypted-jwt
  [:re (re-pattern "(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*$)")])

;; Use a platform-specific predicate to check whether or not a value is
;; a regular expression.
(def regex?
  [:fn (fn [x]
         #?(:cljs (= js/RegExp (type x))
            :clj (= java.util.regex.Pattern (type x))))])

(def algorithms
  [:enum
   ;;"HS256"
   ;;"HS384"
   ;;"HS512"
   ;;"RS256"
   ;;"RS384"
   ;;"RS512"
   ;;"PS256"
   ;;"PS384"
   ;;"PS512"
   "ES256"
   ;;"ES384"
   ;;"ES512"
   ;;"none"
   ])

(def audience
  [:and
   {:description "Valid value for the audience ('aud') claim"
    :example "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"}
   [:or regex? :string]])

(def issuer
  [:and
   {:description "Valid values for the issuer ('iss') claim"
    :example ""}
   [:or :string [:vector :string]]])

(def ident
  [:and
   {:description "Valid value for the JWT identity ('jti') claim"
    :example ""}
   :string])

(def nonce
  [:and
   {:description "Valid value for the nonce ('nonce') claim"
    :example ""}
   :string])

#_(def not-before
  [:and
   {:description "The timestamp at which the token becomes valid"
    :example 1515691416624}
   nat-int?])

(def subject
  [:and
   {:description "Valid value for the subject ('sub') claim"
    :example ""}
   :string])

(def max-age
  [:and
   {:description "Maximum allowed age for tokens to be valid (in seconds or string duration)"
    :example 100}
   [:or :int :string]])

(def timestamp
  [:and
   {:description "Timestamp to use for time comparisons"
    :example 1649958303}
   :int])

(def tolerance
  [:and
   {:description "Time delta (seconds) to tolerate when checking time-related claims"
    :example 5}
   :int
   [:>= 0]])

;; token
;; -----------------------------------------------------------------------------
;; A JSON Web Token.

;; TODO flesh this out.
(def key
  :string)

;; TODO regex:
;; - check character set
;; - check length
;; - check form (header.payload.signature)
(def token-string
  :string)

(def token-map
  :map)

;; A JWT may be provided as an encoded string or as an already-decoded map.
(def token
  [:or token-string token-map])

;; JWT
;; -----------------------------------------------------------------------------
;; This is a JWT as issued by oort.

(def jwt
  [:map
   [:header [:map [:alg algorithms]]]
   [:claims [:map
             [:aud spec.wallet/wallet-address]
             [:iss spec.wallet/wallet-address]
             [:sub spec.wallet/wallet-address]
             [:json-rpc-url :string]
             [:iat number?]
             [:exp number?]]]
   [:token [:re (re-pattern "(^[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*)")]]
   [:signature :string]])

;; verify
;; -----------------------------------------------------------------------------
;; Defines the schema for the options to the com.kubelt.lib.jwt/verify function.

(def options
  [:map {:closed true}
   [:claim/audience {:optional true} audience
    :claim/identity {:optional true} ident
    :claim/issuer {:optional true} issuer
    :claim/nonce {:optional true} nonce
    ;;:claim/not-before {:optional true} not-before
    :claim/subject {:optional true} subject
    :jwt/algorithms {:optional true} algorithms
    :jwt/max-age {:optional true} max-age
    :jwt/timestamp {:optional true} timestamp
    :jwt/tolerance {:optional true} tolerance]])

;; TODO ignore expiry?
;; - check expiry: (ex-info "jwt expired" {:expired/at 1408621000})
;; TODO decode? return decoded JWT
