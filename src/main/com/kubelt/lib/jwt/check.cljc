(ns com.kubelt.lib.jwt.check
  "JWT claim verification checks."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [tick.core :as tick])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.jwt.claim :as lib.jwt.claim]
   [com.kubelt.lib.jwt.header :as lib.jwt.header]
   [com.kubelt.lib.jwt.option :as lib.jwt.option]
   [com.kubelt.lib.re :as lib.re]))

(defn timestamp?
  ""
  [x]
  (nat-int? x))

(defn tolerance?
  ""
  [x]
  (nat-int? x))

;;
;; verify-timestamp
;;

(defn- verify-timestamp
  "Verify the 'timestamp' claim."
  [{claims :claims :as jwt} ]
  ;; TODO
  :fixme
  )

;;
;; max-age
;;

(defn- max-age
  "Verify that the token isn't older than the maximum permitted age."
  []
  :fixme
  )

;;
;; header-algo
;;

(defn- header-algo
  "Check header for 'alg' type to see if it's supported. The :algo option
  is used to determine which are the supported algorithms."
  [{header :header :as jwt} {algorithms :jwt/algorithms}]
  (when algorithms
    (if-let [algo (get header :alg)]
      (let [supported (into #{} algorithms)]
        (if-not (contains? supported algo)
          (lib.jwt.header/failed :alg {:error/reason "unsupported algorithm"
                                       :jwt/algorithms algorithms
                                       :claim/algorithm algo})
          true))
      (lib.jwt.header/missing :alg {:jwt/algorithms algorithms}))))

(comment
  (header-algo {:header {:alg "ES256"}} {:jwt/algorithms ["3DES"]})
  (header-algo {:header {:alg "ES256"}} {:jwt/algorithms []})
  (header-algo {:header {:alg "ES256"}} {:jwt/algorithms ["ES256"]})
  (header-algo {:header {:alg "FOO"}} {})
  )

;;
;; header-type
;;

(defn- header-type
  "Check header for 'typ' to see if it's supported. This header field
  should normally have the value 'JWT'. Accepts no options."
  [{header :header :as jwt} _]
  (let [expected "JWT"]
    (if-let [provided (get header :typ)]
      (if-not (= expected provided)
        (lib.jwt.header/failed :typ "invalid type" {:type/expected expected
                                                    :type/provided provided})
        true)
      (lib.jwt.header/missing :typ {:expected expected}))))

(comment
  (header-type {:header {:typ "JWT"}} {})
  (header-type {:header {:typ "XXX"}} {})
  (header-type {:header {:foo "BAR"}} {})
  )

;; Registered claims:
;; -----------------------------------------------------------------------------
;; - jti (identity): a unique identifier for the JWT
;; - iss (issuer): issuer of the JWT
;; - sub (subject): subject of the JWT (the user)
;; - aud (audience): recipient for which the JWT is intended
;; - exp (expiration time): time after which the JWT expires
;; - nbf (not before time): time at which JWT becomes valid
;; - iat (issued at time): Time at which the JWT was issued

;;
;; identity
;;

(defn- claim-identity
  "Check that the unique token identifier ('jti') exactly matches the
  expected value provided as the value of the :identity key in the options
  map. Use of this claim is OPTIONAL. This claim can be used to prevent
  the JWT from being replayed, i.e. allows a token to be used only
  once."
  [{claims :claims} {expected :claim/identity}]
  (when expected
    (if-let [ident (get claims :jti)]
      (if-not (= ident expected)
        (lib.jwt.claim/failed :jti "invalid identifier" {:expected expected
                                                         :received ident})
        true)
      (lib.jwt.claim/missing :jti {:expected expected}))))

(comment
  (claim-identity {:claims {:jti "robert"}} {:claim/identity "robert"})
  (claim-identity {:claims {:jti "robert"}} {:claim/identity "Robert"})
  (claim-identity {:claims {:jti "robert"}} {:xxx "robert"})
  (claim-identity {:claims {:foo "xxx"}} {:claim/identity "robert"})
  (claim-identity {:claims {:foo "xxx"}} {})
  )

;;
;; expires
;;

(defn- claim-expires
  "Returns true if the current time (provided in the options as the value
  of the :jwt/timestamp key) is strictly before the expiration time
  indicated in the JWT. If the reference time is after the token expiry
  time, the token is *invalid*. The :exp claim is an OPTIONAL but
  recommended registered claim."
  [{claims :claims} {:keys [:jwt/timestamp :jwt/tolerance]}]
  (when timestamp
    (if-let [expires (get claims :exp)]
      ;; Check whether timestamp < expires. The claim and the timestamp
      ;; must be seconds-since-epoch.
      (let [tolerance (if tolerance tolerance 0)
            now-inst (tick/instant timestamp)
            expires-inst (tick/instant expires)]
        (if-not (tick/< now-inst expires-inst)
          ;; TODO use more descriptive keywords in
          ;; error, :claim/expires, token/expires.
          ;; :time/expires (str expires-inst)
          ;; :time/now (str now-inst)
          (lib.jwt.claim/failed :exp "token has expired" {:expected timestamp
                                                          :received expires})
          true))
      (let [now-inst (str (tick/instant timestamp))]
        ;; TODO use more descriptive keyword in error, e.g. :claim/expires
        ;; :time/now now-inst
        (lib.jwt.claim/missing :exp {:expected timestamp})))))

(comment
  ;; current time < expiry time
  (claim-expires {:claims {:exp 1515691416624}} {:jwt/timestamp 0})
  ;; current time < expiry time (close)
  (claim-expires {:claims {:exp 1515691416624}} {:jwt/timestamp 1515691416623})
  ;; current time = expiry time
  (claim-expires {:claims {:exp 1515691416624}} {:jwt/timestamp 1515691416624})
  ;; missing timestamp
  (claim-expires {:claims {:exp 1515691416624}} {:xxx 0})
  ;; expired token
  (claim-expires {:claims {:exp 1515691416624}} {:jwt/timestamp 1515691416625})
  ;; missing claim
  (claim-expires {:claims {:foo 1515691416624}} {:jwt/timestamp 0})
  )

;;
;; not-before
;;

;; TODO prefer using a schema and lib.error/conform to validate options
(defn- claim-not-before
  "Validates the not-before ('nbf') claim that represents the time at
  which the token becomes valid. If the current time is before the
  claimed time the token is invalid. The claim value MUST be a number
  containing a NumericDate value. This is an OPTIONAL registered claim."
  [{claims :claims} {:jwt/keys [timestamp tolerance]}]
  (when-let [not-before (get claims :nbf)]
    (cond
      ;; missing timestamp
      (nil? timestamp)
      (lib.jwt.option/missing :nbf :jwt/timestamp)
      ;; invalid timestamp
      (not (timestamp? timestamp))
      (lib.jwt.option/invalid :nbf :jwt/timestamp {:provided timestamp})
      ;; missing tolerance
      (nil? tolerance)
      (lib.jwt.option/missing :nbf :jwt/tolerance)
      ;; invalid tolerance
      (not (tolerance? tolerance))
      (lib.jwt.option/invalid :nbf :jwt/tolerance {:provided tolerance})
      ;; invalid claim
      (not (timestamp? not-before))
      (lib.jwt.claim/invalid :nbf {:received not-before})
      :else
      ;; Check whether timestamp > not-before. The claim and the
      ;; timestamp must be seconds-since-epoch.
      (if-not (> (- timestamp tolerance) not-before)
        ;; :timestamp (str (tick/instant timestamp))
        ;; :not-before (str (tick/instant not-before))
        (lib.jwt.claim/failed :nbf "token not yet valid" {:received not-before
                                                          :expected timestamp})
        true))))

(comment
  ;; With no timestamp, no way to verify time-related claims.
  (claim-not-before {:claims {:nbf 1515691416624}} {})
  ;; With no not-before claim but with a timestamp, return invalid option error.
  (claim-not-before {:claims {:foo "xxx"}} {:jwt/timestamp 1015691416624})

  (claim-not-before {:claims {:nbf 1515691416624}} {:jwt/timestamp 2015691416624})
  (claim-not-before {:claims {:nbf 1515691416624}} {:jwt/timestamp "foo"})
  ;; Token nbf is before the reference timestamp
  (claim-not-before {:claims {:nbf 1515691416624}} {:jwt/timestamp 2015691416624 :jwt/tolerance 0})

  ;; Token nbf is after the reference timestamp
  (claim-not-before {:claims {:nbf 1515691416624}} {:jwt/timestamp 1015691416624 :jwt/tolerance 0})

  )

;;
;; issued-at
;;

;; TODO validate timestamp
;; - this should be checked in the com.kubelt.spec.jwt/options map
;; TODO validate tolerance
;; - this should be checked in the com.kubelt.spec.jwt/options map
(defn- claim-issued-at
  "The issued-at ('iat') claim records the time at which the token was
  issued. It can be used to determine the age of the token. Its value
  MUST be a number containing a NumericDate value. This is an OPTIONAL
  but recommended registered claim."
  [{claims :claims :as jwt} {:keys [:jwt/timestamp :jwt/tolerance]}]
  (if-let [issued-at (get claims :iat)]
    (cond
      ;; Missing reference timestamp.
      (nil? timestamp)
      (lib.jwt.option/missing :iat :jwt/timestamp)
      ;; Check the timestamp is a NumericDate.
      (not (timestamp? timestamp))
      (lib.jwt.option/invalid :iat {:error/reason "timestamp is not a number"
                                    :jwt/timestamp timestamp})
      ;; Missing tolerance option.
      (nil? tolerance)
      (lib.jwt.option/missing :iat :jwt/tolerance)
      ;; Check that tolerance is a number.
      (not (tolerance? tolerance))
      (lib.jwt.option/invalid :iat {:error/reason "tolerance is not a number"
                                    :jwt/tolerance tolerance})
      ;; The issue time must be an integer timestamp.
      (not (timestamp? issued-at))
      (lib.jwt.claim/failed :iat {:error/reason "issue time is not a number"
                                  :claim/received issued-at})
      ;; Check that iat is in the past. Allows for some clock drift (tolerance).
      (> issued-at (+ timestamp tolerance))
      (lib.jwt.claim/failed :iat {:error/reason "issue time is in the future"
                                  :claim/issued-at issued-at
                                  :jwt/timestamp timestamp
                                  :jwt/tolerance tolerance})
      :else true)))

(comment
  ;; no claim to check, no timestamp options
  (claim-issued-at {:claims {:foo "bar"}} {})
  ;; no claim to check, with timestamp options
  (claim-issued-at {:claims {:foo "bar"}} {:jwt/timestamp 100 :jwt/tolerance 0})
  ;; no timestamp in options
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/tolerance 100})
  ;; token issued before the reference timestamp
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/timestamp 1915691416624 :jwt/tolerance 100})
  ;; token issued later than reference timestamp ("now")
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/timestamp 0 :jwt/tolerance 100})
  ;; token issued before timestamp, within the tolerance
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 1050 :jwt/tolerance 100})
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 1000 :jwt/tolerance 0})
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 999 :jwt/tolerance 0})
  )

;;
;; audience
;;

(defn- claim-audience
  "Check audience claim ('aud'). The :claim/audience value may be a regexp
  or literal string. Use of this claim is OPTIONAL."
  [{claims :claims} {expected :claim/audience}]
  (when expected
    (if-let [audience (get claims :aud)]
      (cond
        ;; exact string match
        (string? expected)
        (if (not= expected audience)
          (lib.jwt.claim/failed :aud {:claim/expected expected :claim/received audience})
          true)
        ;; regular expression match
        (lib.re/regexp? expected)
        (if (not (some? (re-matches expected audience)))
          (lib.jwt.claim/failed :aud {:claim/expected expected :claim/received audience})
          true)
        ;; option value wasn't a string or regex
        :else
        (lib.jwt.claim/invalid :aud {:claim/expected expected}))
      ;; Return an error about the missing claim.
      (lib.jwt.claim/missing :aud {:claim/expected expected}))))

(comment
  (claim-audience {:claims {:aud "public"}} {:xxx "yyy"})
  (claim-audience {:claims {:aud "public"}} {:claim/audience "public"})
  (claim-audience {:claims {:aud "public"}} {:claim/audience "private"})
  (claim-audience {:claims {:aud "public"}} {:claim/audience #"p.*"})
  (claim-audience {:claims {:aud "public"}} {:claim/audience #"q.*"})
  )

;;
;; issuer
;;

(defn- claim-issuer
  "Check issuer claim ('iss'). Supports issuer as string array or
  string. Use of this claim is OPTIONAL."
  [{claims :claims :as jwt} {expected :claim/issuer}]
  (when expected
    (if-let [issuer (get claims :iss)]
      (let [;; Generate a set of allowed values for the issuer
            ;; claim to make it nice and easy to check if the claim
            ;; is included.
            expected (cond
                       (string? expected)
                       #{expected}
                       (and (vector? expected)
                            (every? string? expected))
                       (into #{} expected)
                       :else
                       ;; TODO lib.jwt.claim/invalid to report invalid option
                       (lib.error/error {:message "invalid option"
                                         :issuer expected}))]
        (if (lib.error/error? expected)
          expected
          (if-not (contains? expected issuer)
            (lib.jwt.claim/failed :iss {:claim/expected expected :claim/received issuer})
            true)))
      ;; Return an error about the missing claim.
      (lib.jwt.claim/missing :iss {:expected expected}))))

(comment
  ;; String issuer, direct match
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer "foobar"})
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer ["foobar"]})
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer ["zzz" "foobar"]})
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer "xxx"})
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer ["xxx"]})
  (claim-issuer {:claims {:iss "foobar"}} {:claim/issuer ["xxx" "yyy"]})
  )

;;
;; claim-subject
;;

(defn- claim-subject
  "Check subject claim ('sub'). Expects the subject to be specified as a
  string. Use of this claim is OPTIONAL."
  [{claims :claims} {expected :claim/subject}]
  (when expected
    (if-let [subject (get claims :sub)]
      (if-not (= subject expected)
        (lib.jwt.claim/failed :sub {:claim/expected expected :claim/received subject})
        true)
      (lib.jwt.claim/missing :sub {:claim/expected expected}))))

(comment
  ;; Missing :claim/subject
  (claim-subject {:claims {:sub "xxx"}} {:foo/bar "aaa"})
  ;; Direct match
  (claim-subject {:claims {:sub "xxx"}} {:claim/subject "xxx"})
  ;; Mismatch
  (claim-subject {:claims {:sub "xxx"}} {:claim/subject "yyy"})
  ;; Missing :sub claim
  (claim-subject {:claims {:foo "xxx"}} {:claim/subject "yyy"})
  )

;;
;; claim-nonce
;;

(defn- claim-nonce
  "Verify the 'nonce' claim against the expected nonce. Expected a decoded
  JWT map and the verify options map as arguments. Returns true if there
  is no check to perform because no expected nonce was provided, or if
  the expected nonce matches the provided claim in the JWT
  payload. Otherwise returns false."
  [{claims :claims} {expected :claim/nonce}]
  (when expected
    (when-let [nonce (get claims :nonce)]
      (if-not (= nonce expected)
        (lib.jwt.claim/failed :nonce {:error/reason "nonce does not match"
                                      :claim/expected expected
                                      :claim/received nonce})
        true))))

(comment
  ;; Direct match
  (claim-nonce {:claims {:nonce "foobar"}} {:claim/nonce "foobar"})
  )

;; token
;; -----------------------------------------------------------------------------

;; Verification functions to apply. As a rule, these return true by
;; default, and only apply checking logic if a corresponding value is
;; found in the supplied options map. E.g. if a :nonce is supplied in
;; options, the verify-nonce check will return true if it matches (in
;; whatever way makes sense for that claim) the value in the JWT.
(def ^:private checks
  [#_{:name :timestamp
      :fn verify-timestamp}
   #_{:name :max-age
      :fn verify-max-age}

   ;; TODO this header is optional, recommended to be "JWT" if
   ;; present, but not a failure if absent or has different
   ;; value.
   #_{:name :header/type
      :fn header-type}
   {:name :header/algo
    :fn header-algo}

   {:name :claim/identity
    :fn claim-identity}
   {:name :claim/expires
    :fn claim-expires}
   {:name :claim/not-before
    :fn claim-not-before}
   {:name :claim/issued-at
    :fn claim-issued-at}
   {:name :claim/issuer
    :fn claim-issuer}
   {:name :claim/subject
    :fn claim-subject}
   {:name :claim/audience
    :fn claim-audience}
   {:name :claim/nonce
    :fn claim-nonce}])

;; TODO multimethod for verification, dispatch on alg type
;; TODO check expiry (timestamp, tolerance)
(defn token
  [token options]
  {:pre [(every? map? [token options])]}
  (reduce (fn [result-map {check-name :name check-fn :fn}]
            (let [result (check-fn token options)]
              ;; NB: this stores error objects when verification fails.
              (if (lib.error/error? result)
                (assoc result-map check-name result)
                ;; When nil is returned that verification check wasn't
                ;; requested (by the presence of a corresponding value in
                ;; the options map).
                result-map)))
            {}
            checks))

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

  (token ex-jwt "<key>" {:claim/issuer "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
                         :claim/audience "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
                         :claim/subject "0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E"
                         :claim/identity "foobar"
                         :jwt/algorithms ["ES256"]
                         :jwt/timestamp 1654635855
                         :jwt/tolerance 10})
  )
