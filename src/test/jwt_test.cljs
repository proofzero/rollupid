(ns jwt-test
  "Test JWT operations."
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [cljs.core.async :as async :refer [chan go <! >!]]
    [cljs.core.async.interop :refer-macros [<p!]]
    [goog.object]
    ["crypto" :as crypto]
    [clojure.string :as str]
    [com.kubelt.lib.jwt :as jwt]
    [malli.core :as malli]))

;; test fixtures
(def key-private "-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Faj9WE0bdpUoZRVlc9V+7QoEUOK+piXJQGh+82WcefVbMKb
EQX5oU1dgju3X/quNJQx05jUOvUtkdTY5yDQigUWkGxsKGvtlbYtClYmYxUXxmT+
6WGyGgLio2Ps1UEtE1YGAigs2fqsJigFgqa7h5dEquMz4FCBwLeUPNmG3pPS47li
9WH7r3c7Zhc5CIfdJrfWJRgK3lqX4ZWkvRDn2Mx4P614HI6CGOnT55B9rwUf/KHH
BZlfmoSoPAW6GT6DBGL4aSDn14RERBy+PM4q/qJZHnOuFua8E0rDcp28/eZ/KGal
88xPsV8YCcGbIgIFwMEbTVME3kOg8fcSyFAwqQIDAQABAoIBACFkQZMqqUSSIc5j
//Oq75UQIvvhX30ax97ejB/Xq61GAycTadcopgH8bGhbOeDgRNuYhQPtEtcARPWC
r+EbmVEFz8AGIK+53LKKKF3nwO9Qiib6OQEe73TL0ZduhJ8JezgGKaBe4BFv4/eZ
ooh2QMhSrmbVU5M4VBOXWOMH2l4B+R5gJa5xZga6SA0Jh1nnZstIkAndBMmPdRto
LRjKWriFbbD1LStLs9aSRgnM+pLZAwx0x2ZZnFJwpTOjGTzszpn39w7fRNOhN8bS
+3/W/lQzlpVafCune3WAErE2+1mnHRYEbjSjSs2FT/2tVhU1PVoqRLPBL8iI2r5N
SdrJpCECgYEA+jlA0lyPHQdddixkGUZ8WLOPksRMuHscqFjeV549pQ+PYPbvcEjS
ki5pDVIOMeaIYje89O0exBh6x9CtVwnVJ/7G8MEXIsry7rt0MTpc+NUHYVKfx1Fq
DcDVNw9e7yR3jTBarbxgaMD1XLW0kw1HjgVpAHVQlGPB059zFi1T6usCgYEA1SXb
tRdiQt6viipCIKYxtxPUu9AAMUbeCpDGsR5A8f8+HAC6LUAeOY9/GoSq8FhKS2Go
Fwo4pC7b3yUlxSGXenFFC/liAKPqKLBdn9ppcQ+gjecZFHDHkoOzi5OO067egCyn
EMHQ6XQ2UcZe1CfzJH4hvCKKcc0pAmAptdQHBbsCgYEA0dA6K2oTUqr/UnzMfmkd
ER+XbuCM2E/a6sqBvYRhekt+1TaZ9VQKxSqHSfUZE/yTNZA5MEK3/oPsSCoRfx8u
jffThsLSDImShF3IgxLGLJwsMQ4gDfiVbezYm++Wkf3JBSmbj3yadpv94Xw3aurC
qjKdJhY4uASh3TohPWJKsHsCgYB7F0TdPKbTRTSMjsDnh/KX7ozg9UrXKjzaTydf
a8BHwIZGt6jMrwWFajgVwV3SNLqa88eVnqJ9Nk5lfFdmk3KeFEGym48cHY0BeHBo
+0H/N+4ZZMcYBdVK6GHMjidiWc9GqALG65bQ6vrfmLZ0wKlqfqjOtAfNlpRDOfN8
fPidNwKBgHOFjFanY4O/WzgGb6dzrgH0iUuKfFBxb6z8YYyKBzeW2EPET9bczQma
eI77+RDztNrqx2p4xF4B/yTEIMV7EOA0gS2a5oN31BEsoZsjJNx+9vBddJXO6LB/
D73WF6asd+xd1A8ESz5pnoKhpecoM3W/KRVAwpkTby2/ftzmNriZ
-----END RSA PRIVATE KEY-----") 

(def key-public "-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Faj9WE0bdpUoZRVlc9V
+7QoEUOK+piXJQGh+82WcefVbMKbEQX5oU1dgju3X/quNJQx05jUOvUtkdTY5yDQ
igUWkGxsKGvtlbYtClYmYxUXxmT+6WGyGgLio2Ps1UEtE1YGAigs2fqsJigFgqa7
h5dEquMz4FCBwLeUPNmG3pPS47li9WH7r3c7Zhc5CIfdJrfWJRgK3lqX4ZWkvRDn
2Mx4P614HI6CGOnT55B9rwUf/KHHBZlfmoSoPAW6GT6DBGL4aSDn14RERBy+PM4q
/qJZHnOuFua8E0rDcp28/eZ/KGal88xPsV8YCcGbIgIFwMEbTVME3kOg8fcSyFAw
qQIDAQAB
-----END PUBLIC KEY-----")

(def claims  {:endpoint "bafylmao" 
              :kbtname "bafybafy"  
              :pubkey (jwt/encode key-public)})

;;;;;;;;; low level tests ;;;;;;;
(deftest base64-roundtrip
  (testing "base64 encode and decode"
    (let [challenge "Test me !@#/=34@#$"
          encoded (jwt/encode challenge)
          decoded (jwt/decode encoded)]
      (is (= challenge decoded)))))

(deftest low-level-crypto-sign-verify
  (testing "low level crypto sign and verify"
    (let [claims "test-payload"
          digest (-> (.createSign crypto "RSA-SHA256")
                     (.update claims)
                     (.sign key-private "base64"))]

      (let [verified (-> (.createVerify crypto "RSA-SHA256")
                         (.update claims)
                         (.verify key-public, digest, "base64"))]

        (is (= verified true))))))


;;;;;;;;; unit test ;;;;;;;;;;;;
;; covers create, sign and validate
(deftest create-test-jwt 
  (testing "create and verify jwt"
    (let [
          signing-key (jwt/prepare-key key-private)
          header (jwt/create-header "RS256" "1h")
           payload (jwt/prepare-payload claims)
                      ;; sign and produce token
                     token (jwt/create-jwt key-private header payload)
                      ;; extract public key
                      pbk (jwt/get-public-key token) 
                      ;; validate token 
                       validated (jwt/validate-jwt token pbk)
                     ;;validated true
                       ]
      (is (= pbk key-public))
      (is (= validated true))
      )))
