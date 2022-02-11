(ns p2p-test
  "Test p2p operations."
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [com.kubelt.p2p.handlerequest :as p2p.handlerequest]
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [cljs.core.async :as async :refer [chan go <! >!]]
    [cljs.core.async.interop :refer-macros [<p!]]
    [goog.object]
    ["crypto" :as crypto]
    [clojure.string :as str])


  (:require
    [com.kubelt.lib.jwt :as jwt]
    [malli.core :as malli]
    [com.kubelt.p2p :as p2p]))

;; test fixtures
#_(
   (select-keys value [:db/memory :http/router :hyper/bee])
   [config]
   (let [hyperbee (get config :hyper/bee)
         database (get config :db/memory)
         router (get config :http/router)]
     (let [;; TODO should this be stored as Buffer for raw?
           raw-body (js/Buffer.concat chunks)
           request-map (http.request/req->map req)
           request-method (:http/method request-map)
           request-path (:uri/path request-map)
           context {:request request-map
                    :response {}
                    :body/raw (str raw-body)
                    :p2p/hyperbee hyperbee
                    :p2p/database database}]

       )))

(def key-private (crypto/createSecretKey (js/Buffer.from "-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----") "utf8"))

(def key-public "-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Faj9WE0bdpUoZRVlc9V
+7QoEUOK+piXJQGh+82WcefVbMKbEQX5oU1dgju3X/quNJQx05jUOvUtkdTY5yDQ
igUWkGxsKGvtlbYtClYmYxUXxmT+6WGyGgLio2Ps1UEtE1YGAigs2fqsJigFgqa7
h5dEquMz4FCBwLeUPNmG3pPS47li9WH7r3c7Zhc5CIfdJrfWJRgK3lqX4ZWkvRDn
2Mx4P614HI6CGOnT55B9rwUf/KHHBZlfmoSoPAW6GT6DBGL4aSDn14RERBy+PM4q
/qJZHnOuFua8E0rDcp28/eZ/KGal88xPsV8YCcGbIgIFwMEbTVME3kOg8fcSyFAw
qQIDAQAB
-----END PUBLIC KEY-----")


(def key-hash
  (doto (Sha256.)
    (.update  key-public)
    (.digest)))

(def pubkey-hash (.encodeString base64 key-hash goog.crypt.base64.BASE_64_URL_SAFE))

(def payload #js { "pubkey" key-public "endpoint" "bafylmao" "kbtname" pubkey-hash})

(def sign-options {:expires "1h" :alg "HS256"})

(deftest validate-jwt-test
  (t/async done
           (go
             (let [ token-p  (jwt/sign-payload payload key-private sign-options)]
               (is (not= token-p nil))
               (-> token-p
                   (.then (fn[token]
                            (let [validated-p (p2p.handlerequest/validate-jwt (js->clj token))]
                              (is (not= validated-p nil))
                              (-> validated-p
                                      (.then (fn[validated]
                                               (prn validated)))
                                      )))))))))

;; create jwt
;; check invalid payload
;; check invalid pubkey
;; check invalid date
;; check invalid key
;; check invalid kbtname
;; check invalid kbtvalue

(deftest user-namespace-test
  ;; TODO test p2p.handlerequest.user-namespace
  (testing "user-namespace-test"

    ;; use jwt
    ;; run p2p.handlerequest.user-namespace
    ;; check for mock hyperbee namespace
    ;; compare namespace matches jwt
    ))


(deftest kbt-resolve-test
  ;; TODO test p2p.handlerequest.kbt-resolve
  (testing "example test routine"

    ;; set mock key/value
    ;; run kbt-resolve
    ;; check result to match original

    ))

(deftest kbt-update-test
  ;; TODO test p2p.handlerequest.kbt-update
  (testing "example test routine"

    ;; check invalid kbt-name
    ;; check bad request

    ))

;;(deftest

#_(deftest vec->multiaddr-str-test

    (let [mytestval p2p/copyright-year]
      ;;(is (= mytestval 2022)))))
      (is (= 2021 2022)))
    (testing "convert valid vector"
      (let [host "127.0.0.1"
            port 8080
            v [:ip4 host :tcp port]
            s (multiaddr/vec->str v)]
        (is (string? s)
            "output is a string")
        (is (str/includes? s host)
            "host IP address is included")
        (is (str/includes? s port)
            "host port is included"))))

#_(deftest str->map-test
    (testing "multiaddr string conversion"
      (let [host "127.0.0.1"
            port 8080
            maddr-str (multiaddr/vec->str [:ip4 host :tcp port])
            maddr-map (multiaddr/str->map maddr-str)]
        (is (map? maddr-map)
            "conversion result must be a map")
        ;; TODO write a schema for this type
        (is (contains? maddr-map :kubelt/type))
        (is (contains? maddr-map :address/host))
        (is (contains? maddr-map :address/port))
        (is (contains? maddr-map :address/family))
        (is (contains? maddr-map :address/protos))

        ;; TODO more tests
        (is (= host (get maddr-map :address/host)))
        (is (= port (get maddr-map :address/port)))))

    #_(testing "invalid host address"
        (let [host "localhost"
              port 8080
              maddr-str (multiaddr/vec->str [:ip4 host :tcp port])
              maddr-map (multiaddr/str->map maddr-str)]
          ;; This is an error; how to handle? Fail spec validation? Return
          ;; error map?
          )))
