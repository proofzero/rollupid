(ns lib.jwt-test
  "Test JWT operations."
  #?(:node
     (:require
      ["crypto" :as crypto]))
  #?(:cljs
     (:require
      [cljs.test :as t :refer [deftest is testing use-fixtures]]
      [goog.iter])
     :clj
     (:require
      [clojure.test :as t :refer [deftest is testing use-fixtures]]))
  (:require
   [com.kubelt.lib.jwt :as jwt]))

#?(:node
   (def keypair
     (.generateKeyPairSync crypto "rsa"
                           (js-obj
                            "modulusLength" 2048
                            "publicKeyEncoding" (js-obj "type" "spki"
                                                        "format" "pem"
                                                        "privateKeyEncoding" (js-obj  "format" "pem"))))))

#?(:node (def key-private (.-privateKey keypair)))

#?(:node (def key-public (.-publicKey keypair)))

#?(:node
   (def claims {:endpoint "bafylmao"
                :kbtname "bafybafy"
                :pubkey (jwt/encode key-public)}))

;;;;;;;;; low level tests ;;;;;;;

#?(:node
   (deftest base64-roundtrip
     (testing "base64 encode and decode"
       (let [challenge "Test me !@#/=34@#$"
             encoded (jwt/encode challenge)
             decoded (jwt/decode encoded)]
         (is (= challenge decoded))))))

#?(:node
   (deftest low-level-crypto-sign-verify
     (testing "low level crypto sign and verify"
       (let [claims "test-payload"
             digest (-> (.createSign crypto "RSA-SHA256")
                        (.update claims)
                        (.sign key-private "base64"))]
         (let [verified (-> (.createVerify crypto "RSA-SHA256")
                            (.update claims)
                            (.verify key-public digest "base64"))]
           (is (= verified true)))))))

;;;;;;;;; unit test ;;;;;;;;;;;;
;; covers create, sign and validate

#?(:node
   (deftest create-test-jwt
     (testing "create and verify jwt"
       (let [signing-key (jwt/prepare-key key-private)
             header (jwt/create-header "RS256" "1h")
             payload (jwt/prepare-payload claims)
             ;; sign and produce token
             token (jwt/create-jwt key-private header payload)
             ;; extract public key
             pbk (jwt/get-public-key token)
             ;; validate token
             validated (jwt/validate-jwt token)]
         ;;validated true
         (is (= pbk key-public))
         (is (= validated true))))))
