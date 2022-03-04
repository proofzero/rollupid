(ns com.kubelt.lib.p2p
  "Wrapper around the external p2p naming system."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require-macros
   [cljs.core.async.interop :refer [<p!]]
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :as async :refer [<!]]
   [clojure.string :as str])
  (:require
   [cognitect.transit :as transit])
  (:require
   [com.kubelt.lib.base64 :as lib.base64]
   [com.kubelt.lib.crypto.digest :as lib.crypto.digest]
   [com.kubelt.lib.multiaddr :as ma]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.jwt :as jwt]
   [com.kubelt.proto.http :as http]))

(defn register!
  "Register an account, performing any initial setup that is required. The
  account is a map that contains the public key from the keypair that
  represents the user's account."
  [sys wallet]
  ;; TODO get nonce
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        public-key (get wallet :wallet/public-key)
        ;;path (str/join "/" ["" "register" public-key])
        path "/auth"
        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body "{\"pk\": \"hereiam5\"}"
                 ;; TODO read scheme from sys
                 :uri/scheme :http
                 :uri/domain host
                 :uri/path path
                 :uri/port port}]
    ;; TODO extract the user's public key from the account map
    ;; (for use as an account identifier)

    ;; TODO make an HTTP request to p2p system, passing along the pub key
    ;; (expect a nonce in return, which should be signed and returned to
    ;; prove ownership of provided key and complete registration? to what
    ;; extent is this flow already defined by OAuth, JWT, etc.?)
    (http/request! client request)))


(defn str->bytes
  "Convert a string into a byte array. In Clojure this is a [B, while in
  ClojureScript it returns a Uint8Array."
  [s]
     (let [text-encoder (js/TextEncoder.)]
             (.encode text-encoder s)))

(defn append-array
  [a b]
  (prn {:a a :b b})
  (let [alen (alength a)
        blen (alength b)
        tmp (js/ArrayBuffer. (+ alen blen))
        tmp8 (js/Uint8Array. tmp)]

    (.set tmp8 a, 0)
    (.set tmp8 b, alen)

    tmp8))

(defn prepare-nonce-
  "internal prep function for nonce"
  [nonce-b64 client-nonce]
(prn {:hereiam 1025 :n64 nonce-b64 :cn client-nonce})
  (let [decoded-bytes (lib.base64/decode-bytes nonce-b64)
        digest-input (append-array decoded-bytes client-nonce)]
        (prn {:hereiam 1026 :dbytes decoded-bytes :cn client-nonce :di digest-input})
    (let [
        digest-output (lib.crypto.digest/sha2-256 digest-input)]
    (prn :hereiam 1024 :digest-in digest-input :digest-out digest-output)
    digest-output)))



(defn authenticate!
  "log into remote peer with keypair"
  [sys wallet]
  (let [writer (transit/writer :json)                  
        client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        public-key (get wallet :wallet/public-key)
        ;;path (str/join "/" ["" "register" public-key])
        path "/auth"
        request-body {:pk "hereiam6" :hereiam 1}
        payload (lib.json/edn->json-str request-body) 
        _ (prn {:hereiam 332 :payload payload :req-body request-body})
        request {:com.kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/body payload
                 ;; TODO read scheme from sys
                 :uri/scheme :http
                 :uri/domain host
                 :uri/path path
                 :uri/port port}]
    (prn {:hereiam 61 :request request})
    ;; TODO extract the user's public key from the account map
    ;; (for use as an account identifier)

    ;; TODO make an HTTP request to p2p system, passing along the pub key
    ;; (expect a nonce in return, which should be signed and returned to
    ;; prove ownership of provided key and complete registration? to what
    ;; extent is this flow already defined by OAuth, JWT, etc.?)
    (let [token-chan (http/request! client request)]
           (async/go 
             (async/take! token-chan (fn [x] 
                                       (prn {:hereiam 333 :x x})
              (let [client-nonce (str->bytes "abcdabcd")
                    _ (prn {:hereiam 443 :cnonce client-nonce })
                    digest-output (prepare-nonce- (str x) client-nonce)]
                
                (let [verify-path "/auth/verify"
                      _ (prn {:hereiam 444 :cnonce client-nonce :cdigest digest-output})
                      cnonce (lib.base64/encode-unsafe client-nonce)
                      cdigest (lib.base64/encode-unsafe (get digest-output :digest/bytes))
                      _ (prn {:hereiam 445 :cnonce2 cnonce :cdigest2 cdigest})
                      headers {"Content-Type" "application/json"}
                      verify-body {:pk "hereiam7" 
                                   :nonce cnonce
                                   :digest cdigest }
                      verify-payload (lib.json/edn->json-str verify-body)
                      _ (prn {:hereiam 447 :pay verify-payload})
                      verify-request {:com.kubelt/type :kubelt.type/http-request
                                      :http/method :post
                                      :http/headers headers
                                      :http/body verify-payload
                                      :uri/scheme :http
                                      :uri/domain host
                                      :uri/path verify-path
                                      :uri/port port}
                      verify-result (http/request! client verify-request)]
                  (async/go
                    (async/take! verify-result (fn[y]
                                                 (prn {:hereiam 9 :verify-result y :request verify-request}))))))))))))

                

(defn store!
  "Store a key/value pair for the given user account. Returns a core.async
  channel."
  [sys wallet key value]
  ;; TODO register public key with initial (register!)
  ;; call?
  (let [client (get sys :client/http)
        ;; If you need to know what platform you're running on, you
        ;;can get the value of :sys/platform from the system map.
        ;;platform (get sys :sys/platform)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/write :address/host])
        port (get-in sys [:client/p2p :p2p/write :address/port])
        path (str/join "/" ["" "kbt" key])
        public-key (get wallet :account/public-key)
        body {:kbt/name key
              :kbt/value value
              :key/public public-key}
        ;; TODO sign request using user key pair
        ;;body-str (<p! (jwt/sign body))
        transit-writer (transit/writer :json)
        body-str (transit/write transit-writer body)
        headers {"Content-Type" "application/transit+json"}
        request {:kubelt/type :kubelt.type/http-request
                 :http/method :post
                 :http/headers headers
                 :http/body body-str
                 ;;:uri/scheme scheme
                 :uri/scheme :http
                 :uri/domain host
                 :uri/port port
                 :uri/path path}]
    ;; (attach a signature to the request that p2p node can use to
    ;; validate that the request came from the owner of the public key
    ;; that was used to register; prefer an existing web request signing
    ;; standard)
    ;;
    ;; Returns a core.async channel.
    (http/request! client request)))

(defn query!
  "Retrieve the value for a given key for a given user account. Returns a
  core.async channel."
  [sys wallet key]
  (let [client (get sys :client/http)
        scheme (get-in sys [:client/p2p :p2p/read :http/scheme])
        host (get-in sys [:client/p2p :p2p/read :address/host])
        port (get-in sys [:client/p2p :p2p/read :address/port])
        public-key (get wallet :wallet/public-key)
        path (str/join "/" ["" "kbt" public-key])
        ;; TODO JWT sign request?
        request {:kubelt/type :kubelt.type/http-request
                 ;; TODO make this a default
                 ;;:http/version "1.1"
                 ;; TODO make this a default
                 :http/method :get
                 ;;:uri/scheme scheme
                 :uri/scheme :http
                 :uri/domain host
                 :uri/port port
                 :uri/path path}]
    ;; TODO extract user's public key from the account map
    ;; (for use as account identifier)
    (http/request! client request)))
