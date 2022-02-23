(ns p2p-test
  "Test p2p operations."
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [cljs.core.async :as async :refer [chan go <! >!]]
    [cljs.core.async.interop :refer-macros [<p!]]
    [clojure.string :as str])

  (:require 
    [goog.object]
    [malli.core :as malli])
  
  (:require
    ["crypto" :as crypto])

  (:require
    [com.kubelt.lib.jwt :as jwt]
    [com.kubelt.p2p :as p2p]
    [com.kubelt.p2p.handle-request :as p2p.handle-request]))

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

(def keypair (.generateKeyPairSync crypto "rsa" 
                                   (js-obj 
                                     "modulusLength" 2048
                                     "publicKeyEncoding" (js-obj "type" "spki" "format" "pem"
                                     "privateKeyEncoding" (js-obj  "format" "pem"
                                                                 ))
                                           )))

(def key-private (.-privateKey keypair))
(def key-public (.-publicKey keypair))
(def key-hash
  (doto (Sha256.)
    (.update  key-public)
    (.digest)))

(def pubkey-hash (.encodeString base64 key-hash goog.crypt.base64.BASE_64_URL_SAFE))

(def payload #js { "pubkey" key-public "endpoint" "bafylmao" "kbtname" pubkey-hash})

(def sign-options {:expires "1h" :alg "RS256"})


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
