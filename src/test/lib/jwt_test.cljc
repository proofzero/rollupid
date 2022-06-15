(ns lib.jwt-test
  "Test JWT operations."
  #?(:node
     (:require
      ["crypto" :as crypto]))
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.jwt.check :as jwt.check]))

;; TODO move into utility namespace
(defn re->str
  "Takes a regular expression and returns the string source used to create
  it."
  [regex]
  #?(:cljs (.-source regex)
     :clj (.pattern regex)))

(deftest header-algo
  (testing "jwt :alg header"
    (let [f #'jwt.check/header-algo]

      (testing "no header check required"
        (is (nil? (f {:header {:alg "FOO"}} {}))
            "check not performed when missing :jwt/algorithms option"))

      (testing "permitted algorithm found"
        (is (= true (f {:header {:alg "ES256"}} {:jwt/algorithms ["ES256"]}))
            "token algorithm in permitted set"))

      (testing "no permitted algorithms supplied"
        (let [result (f {:header {:alg "ES256"}} {:jwt/algorithms []})]
          (is (lib.error/error? result)
              "empty set of expected algorithms generates an error")
          (is (= "unsupported algorithm" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:header :alg] (get-in result [:error :failed]))
              "error correctly indicates the failed header")
          (is (= "ES256" (get-in result [:error :algorithm/token]))
              "error reports the provided value for the header")
          (is (= [] (get-in result [:error :algorithm/supported]))
              "error reports the permitted values for the claim")))

      (testing "no permitted algorithm found"
        (let [result (f {:header {:alg "ES256"}} {:jwt/algorithms ["3DES"]})]
          (is (lib.error/error? result)
              "unexpected token algorithm generates an error")
          (is (= "unsupported algorithm" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:header :alg] (get-in result [:error :failed]))
              "error correctly indicates the failed header")
          (is (= "ES256" (get-in result [:error :algorithm/token]))
              "error reports the provided value for the header")
          (is (= ["3DES"] (get-in result [:error :algorithm/supported]))
              "error reports the permitted values for the claim"))))))

(deftest header-type
  (testing "jwt :typ header"
    (let [f #'jwt.check/header-type]

      (testing ":typ header has expected value"
        (is (= true (f {:header {:typ "JWT"}} {}))
            "token type has expected value"))

      (testing ":typ header has unexpected value"
        (let [result (f {:header {:typ "XXX"}} {})]
          (is (lib.error/error? result)
              "token not of expected type")
          (is (= "invalid type" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "XXX" (get-in result [:error :type/provided]))
              "error reports the provided value for the header")
          (is (= "JWT" (get-in result [:error :type/expected]))
              "error reports the expected value for the header")))

      (testing ":typ header is missing"
        (let [result (f {:header {:foo "BAR"}} {})]
          (is (lib.error/error? result)
              "missing type header generates an error")
          (is (= "missing header" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:header :typ] (get-in result [:error :missing]))
              "error reports which header is missing")
          (is (= "JWT" (get-in result [:error :expected]))
              "error reports the expected value for the header"))))))

(deftest claim-identity
  (testing "jwt :jti claim"
    (let [f #'jwt.check/claim-identity]

      (testing "no check to perform"
        (is (nil? (f {:claims {:jti "robert"}} {}))
            "check not performed when missing :claim/identity option"))

      (testing "direct match of identity claim"
        (is (= true (f {:claims {:jti "robert"}} {:claim/identity "robert"}))
            "token claim matches expected value"))

      (testing "string matches are case sensitive"
        (let [result (f {:claims {:jti "robert"}} {:claim/identity "Robert"})]
          (is (lib.error/error? result)
              "mismatched identity generates an error")
          (is (= "invalid identifier" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:claims :jti] (get-in result [:error :failed]))
              "error reports which claim has failed")
          (is (= "Robert" (get-in result [:error :expected]))
              "error reports the expected value for the claim")
          (is (= "robert" (get-in result [:error :received]))
              "error reports the received value for the claim")))

      (testing "identity header is missing when being checked"
        (let [result (f {:claims {:foo "xxx"}} {:claim/identity "robert"})]
          (is (lib.error/error? result)
              "missing claim generates an error")
          (is (= "missing claim" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:claims :jti] (get-in result [:error :missing]))
              "error reports which claim is missing")
          (is (= "robert" (get-in result [:error :expected]))
              "error reports the expected value for the claim")))

      (testing "identity header is missing when not being checked"
        (is (nil? (f {:claims {:foo "xxx"}} {}))
            "missing header not an error when check not required")))))

(deftest claim-expires
  (testing "jwt :exp claim"
    (let [f #'jwt.check/claim-expires
          ts 1515691416624
          ts+1 (inc ts)
          ts-1 (dec ts)]

      (testing "no check performed when missing :jwt/timestamp option"
        (is (nil? (f {:claims {:exp 0}} {}))
            "check not performed when missing :jwt/timestamp option"))

      (testing "current time < expiry time"
        (is (= true (f {:claims {:exp ts}} {:jwt/timestamp 0}))
            "expiry time in the far future")
        (is (= true (f {:claims {:exp ts}} {:jwt/timestamp ts-1}))
            "expiry time in the near future"))

      (testing "expired token"

        (testing "expiry time = current time"
          (let [result (f {:claims {:exp ts}} {:jwt/timestamp ts})]
            (is (lib.error/error? result)
                "expired token generates an error")
            (is (= "token has expired" (get-in result [:error :message]))
                "error has the correct description")
            (is (= [:claims :exp] (get-in result [:error :failed]))
                "error reports which claim has failed")
            (is (= ts (get-in result [:error :received]))
                "error reports the received claim value")
            (is (= ts (get-in result [:error :expected]))
                "error reports the timestamp")))

        (testing "timestamp > token expiry time"
          (let [result (f {:claims {:exp ts}} {:jwt/timestamp ts+1})]
            (is (lib.error/error? result)
                "expired token generates an error")
            (is (= "token has expired" (get-in result [:error :message]))
                "error has the correct description")
            (is (= [:claims :exp] (get-in result [:error :failed]))
                "error reports which claim has failed")
            (is (= ts (get-in result [:error :received]))
                "error reports the received claim value")
            (is (= ts+1 (get-in result [:error :expected]))
                "error reports the timestamp"))))

      ;; TODO this claim is optional, this shouldn't be an error
      (testing "missing expiry claim"
        (let [result (f {:claims {:foo "bar"}} {:jwt/timestamp ts})]
            (is (lib.error/error? result)
                "missing :exp claim generates an error")
            (is (= "missing claim" (get-in result [:error :message]))
                "error has the correct description")
            (is (= [:claims :exp] (get-in result [:error :missing]))
                "error reports which claim is missing")
            (is (= ts (get-in result [:error :expected]))
                "error reports the received claim value"))))))

(deftest claim-not-before
  (testing "jwt :nbf claim"
    (let [f #'jwt.check/claim-not-before
          ts 1515691416624
          ts+1 (inc ts)
          ts-1 (dec ts)]

      (testing "missing :nbf claim when :jwt/timestamp provided"
        (is (nil? (f {:claims {:foo "xxx"}} {:jwt/timestamp ts}))
            "the not-before claim is optional"))

      (testing "options"

        (testing "missing :jwt/timestamp option"
          (let [result (f {:claims {:nbf ts}} {})]
            (is (lib.error/error? result)
                "missing :jwt/timestamp option causes error")
            (is (= "missing option" (get-in result [:error :message]))
                "error has the correct description")
            (is (= :jwt/timestamp (get-in result [:error :missing]))
                "error reports which option was missing")
            (is (= [:claims :nbf] (get-in result [:error :claim]))
                "error reports claim that couldn't be checked")))

        (testing "invalid :jwt/timestamp option"
          (let [result (f {:claims {:nbf ts}} {:jwt/timestamp "foobar"})]
            (is (lib.error/error? result)
                "invalid :jwt/timestamp option causes error")
            (is (= "invalid option" (get-in result [:error :message]))
                "error has the correct description")
            (is (= :jwt/timestamp (get-in result [:error :invalid]))
                "error reports which option was invalid")
            (is (= [:claims :nbf] (get-in result [:error :claim]))
                "error reports claim that couldn't be checked")))

        (testing "missing :jwt/tolerance option"
          (let [result (f {:claims {:nbf ts}} {:jwt/timestamp ts})]
            (is (lib.error/error? result)
                "missing :jwt/tolerance option causes error")
            (is (= "missing option" (get-in result [:error :message]))
                "error has the correct description")
            (is (= :jwt/tolerance (get-in result [:error :missing]))
                "error reports which option was missing")
            (is (= [:claims :nbf] (get-in result [:error :claim]))
                "error reports claim that couldn't be checked")))

        (testing "invalid :jwt/tolerance option"
          (let [result (f {:claims {:nbf ts}} {:jwt/timestamp ts :jwt/tolerance "foobar"})]
            (is (lib.error/error? result)
                "invalid :jwt/tolerance option causes error")
            (is (= "invalid option" (get-in result [:error :message]))
                "error has the correct description")
            (is (= :jwt/tolerance (get-in result [:error :invalid]))
                "error reports which option was invalid")
            (is (= [:claims :nbf] (get-in result [:error :claim]))
                "error reports claim that couldn't be checked"))))

      (testing "token nbf time is before the current time"
        (is (= true (f {:claims {:nbf ts}} {:jwt/timestamp ts+1 :jwt/tolerance 0}))
            "not-before time is after current timestamp"))

      (testing "token nbf time is after the reference timestamp"
        (let [result (f {:claims {:nbf ts+1}} {:jwt/timestamp ts :jwt/tolerance 0})]
          (is (lib.error/error? result)
              "invalid :jwt/tolerance option causes error")
          (is (= "token not yet valid" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:claims :nbf] (get-in result [:error :failed]))
              "error reports claim that failed")
          (is (= ts (get-in result [:error :expected]))
              "error reports the expected claim value")
          (is (= ts+1 (get-in result [:error :received]))
                "error reports the expected claim value")))

      (testing "claim falls within tolerance window "
        ;; TODO
        ))))

(deftest claim-issued-at
  (testing "jwt :iat claim"
    ))
(comment
  ;; no timestamp in options
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/tolerance 100})
  ;; token issued later than reference timestamp ("now")
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/timestamp 0 :jwt/tolerance 100})
  ;; token issued before the reference timestamp
  (claim-issued-at {:claims {:iat 1515691416624}} {:jwt/timestamp 1915691416624 :jwt/tolerance 100})
  ;; token issued before timestamp, within the tolerance
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 1050 :jwt/tolerance 100})
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 1000 :jwt/tolerance 0})
  (claim-issued-at {:claims {:iat 1000}} {:jwt/timestamp 999 :jwt/tolerance 0})
  )

(deftest claim-audience
  (testing "jwt :aud claim"
    (let [f #'jwt.check/claim-audience]

      (testing "no claim check requested"
        (is (nil? (f {:claims {:aud "public"}} {:xxx "yyy"}))
            "check not performed when missing :claim/audience option"))

      (testing "direct string match"
        (is (= true (f {:claims {:aud "public"}} {:claim/audience "public"}))
            "direct string match of token claim and expected value"))

      (testing "claim mismatch"
        (let [result (f {:claims {:aud "public"}} {:claim/audience "private"})]
          (is (lib.error/error? result)
              "token claim and expected value do not match")
          (is (= "invalid audience" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "public" (get-in result [:error :received]))
              "error reports the provided value for the claim")
          (is (= "private" (get-in result [:error :expected]))
              "error reports the permitted values for the claim")))

      (testing "regex match"
        (is (= true (f {:claims {:aud "public"}} {:claim/audience #"p.*"}))
            "regular expression match of token claim and expected value"))

      (testing "regex mismatch"
        (let [result (f {:claims {:aud "public"}} {:claim/audience #"q.*"})]
          (is (lib.error/error? result)
              "token claim and expected value do not match")
          (is (= "invalid audience" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "public" (get-in result [:error :received]))
              "error reports the provided value for the claim")
          (is (= "q.*" (re->str (get-in result [:error :expected])))
              "error reports the permitted values for the claim")
          (is (= [:claims :aud] (get-in result [:error :failed]))
              "error indicates which claim it was that failed"))))))

(deftest claim-issuer
  (testing "jwt :iss claim"
    (let [;; Use var to bypass private attribute of function under test.
          f #'jwt.check/claim-issuer]

      (testing "No claim check requested"
        (is (nil? (f {:claims {:iss "xxx"}} {:foo/bar "aaa"}))
            "check not performed when missing :claim/issuer option"))

      (testing "direct matching"
        (is (= true (f {:claims {:iss "xxx"}} {:claim/issuer "xxx"}))
            "direct string match of token claim and expected value")
        (is (= true (f {:claims {:iss "xxx"}} {:claim/issuer ["xxx"]}))
            "expected value can be provided as vector")
        (is (= true (f {:claims {:iss "xxx"}} {:claim/issuer ["zzz" "xxx"]}))
            "multiple expected values can be provided"))

      (testing "mismatch with expected value provided as a string"
        (let [result (f {:claims {:iss "foobar"}} {:claim/issuer "xxx"})]
          (is (lib.error/error? result)
              "token claim and expected value do not match")
          (is (= "invalid issuer" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "foobar" (get-in result [:error :received]))
              "error reports the provided value for the claim")
          (is (= #{"xxx"} (get-in result [:error :expected]))
              "error reports the permitted values for the claim")))

      (testing "mismatch with expected value provided as a vector"
        (let [result (f {:claims {:iss "foobar"}} {:claim/issuer ["xxx"]})]
          (is (lib.error/error? result)
              "token claim and expected value do not match")
          (is (= "invalid issuer" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "foobar" (get-in result [:error :received]))
              "error reports the provided value for the claim")
          (is (= #{"xxx"} (get-in result [:error :expected]))
              "error reports the permitted values for the claim")))

      (testing "mismatch with expected values provided as a vector"
        (let [result (f {:claims {:iss "foobar"}} {:claim/issuer ["xxx" "yyy"]})]
          (is (lib.error/error? result)
              "token claim and expected value do not match")
          (is (= "invalid issuer" (get-in result [:error :message]))
              "error has the correct description")
          (is (= "foobar" (get-in result [:error :received]))
              "error reports the provided value for the claim")
          (is (= #{"xxx" "yyy"} (get-in result [:error :expected]))
              "error reports the permitted values for the claim"))))))

(deftest claim-subject
  (testing "jwt :sub claim"
    (let [;; Use var to bypass private attribute of function under test.
          f #'jwt.check/claim-subject]
      (testing "no check option supplied"
        (is (nil? (f {:claims {:sub "xxx"}} {:foo/bar "aaa"}))
            "check not performed when missing :claim/subject option"))

      (testing "direct match"
        (is (= true (f {:claims {:sub "xxx"}} {:claim/subject "xxx"}))
            "token claim matches expected audience"))

      (testing "claim doesn't match expected"
        (let [result (f {:claims {:sub "xxx"}} {:claim/subject "yyy"})]
          (is (lib.error/error? result)
              "token claim doesn't match expected audience")
          (is (= "yyy" (get-in result [:error :expected]))
              "error reports the expected value for the claim")
          (is (= "xxx" (get-in result [:error :received]))
              "error reports the received value for the claim")
          (is (= "invalid subject" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:claims :sub] (get-in result [:error :failed]))
              "error indicates which claim has failed")))

      (testing "missing subject claim in token when check requested"
        (let [result (f {:claims {:foo "bar"}} {:claim/subject "yyy"})]
          (is (lib.error/error? result)
              "token doesn't have a subject claim")
          (is (= "yyy" (get-in result [:error :expected]))
              "error reports the expected value for the claim")
          (is (= "missing claim" (get-in result [:error :message]))
              "error has the correct description")
          (is (= [:claims :sub] (get-in result [:error :missing]))
              "error indicates which claim is missing"))))))

;; #?(:node
;;    (def keypair
;;      (.generateKeyPairSync crypto "rsa"
;;                            (js-obj
;;                             "modulusLength" 2048
;;                             "publicKeyEncoding" (js-obj "type" "spki"
;;                                                         "format" "pem"
;;                                                         "privateKeyEncoding" (js-obj  "format" "pem"))))))

;; #?(:node (def key-private (.-privateKey keypair)))

;; #?(:node (def key-public (.-publicKey keypair)))

;; #?(:node
;;    (def claims {:endpoint "bafylmao"
;;                 :kbtname "bafybafy"
;;                 :pubkey (jwt/encode key-public)}))

;; ;;;;;;;;; low level tests ;;;;;;;

;; #?(:node
;;    (deftest base64-roundtrip
;;      (testing "base64 encode and decode"
;;        (let [challenge "Test me !@#/=34@#$"
;;              encoded (jwt/encode challenge)
;;              decoded (jwt/decode encoded)]
;;          (is (= challenge decoded))))))

;; #?(:node
;;    (deftest low-level-crypto-sign-verify
;;      (testing "low level crypto sign and verify"
;;        (let [claims "test-payload"
;;              digest (-> (.createSign crypto "RSA-SHA256")
;;                         (.update claims)
;;                         (.sign key-private "base64"))]
;;          (let [verified (-> (.createVerify crypto "RSA-SHA256")
;;                             (.update claims)
;;                             (.verify key-public digest "base64"))]
;;            (is (= verified true)))))))

;; ;;;;;;;;; unit test ;;;;;;;;;;;;
;; ;; covers create, sign and validate

;; #?(:node
;;    (deftest create-test-jwt
;;      (testing "create and verify jwt"
;;        (let [signing-key (jwt/prepare-key key-private)
;;              header (jwt/create-header "RS256" "1h")
;;              payload (jwt/prepare-payload claims)
;;              ;; sign and produce token
;;              token (jwt/create-jwt key-private header payload)
;;              ;; extract public key
;;              pbk (jwt/get-public-key token)
;;              ;; validate token
;;              validated (jwt/validate-jwt token)]
;;          ;;validated true
;;          (is (= pbk key-public))
;;          (is (= validated true))))))
