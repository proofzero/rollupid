(ns com.kubelt.p2p.handle-request
  "interceptor business logic"
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    ["crypto" :as crypto]
    [goog.crypt.base64 :as base64]
    [goog.object])
  (:require
    [taoensso.timbre :as log]
    [com.kubelt.lib.http.status :as http.status]
    [com.kubelt.p2p.proto :as p2p.proto]
    [clojure.string :as str]
    [com.kubelt.lib.jwt :as jwt]))

(defn set-user-namespace [pubkey]
  (let [hasher (Sha256.)]
    (.update hasher pubkey)
    (let [key-hash (.digest hasher)
          pubkey-hash (.encodeString base64 key-hash goog.crypt.base64.BASE_64_URL_SAFE)]

      ;; set hyperbee ns
      ;;(.sub (get ctx :p2p/hyperbee) pubkey-hash)

      pubkey-hash)))

;; business logic
;; returns a promise
(defn validate-jwt [payload]

#_(  signing-key (jwt/prepare-key key-private)
  header (jwt/create-header "RS256" "1h")
  payload (jwt/prepare-payload claims)

  ;; sign and produce token
  token (jwt/create-jwt key-private header payload)

  ;; validate token
  validated (jwt/validate-jwt token)
)
 (let [pubkey (jwt/get-public-key payload )]
  ;;validated true
  (jwt/validate-jwt (clj->js payload))))


(defn kbt-resolve [kvstore kbt-name]

  ;; Context has a :match key containing the routing
  ;; table match data.
  ;; The Hyperbee .get() request returns a promise. Note
  ;; that js/Promise is an AsyncContext, so execution pauses
  ;; until the promise resolves.
  (-> (p2p.proto/query kvstore kbt-name)
      (.then (fn [kbt-object]
               (let [;; Hyperbee returns an object that
                     ;; includes sequence number, etc.
                     kbt-value (str (.-value kbt-object))]
                 (if-not (str/blank? kbt-value)
                   (do
                     (log/info {:log/msg "found name"
                                :kbt/name kbt-name
                                :kbt/value kbt-value})
                     (let [body {:name kbt-name :value kbt-value}]
                       body))
                   nil))))))


(defn kbt-update [bee kbt-name kbt-value]
  (p2p.proto/store bee kbt-name kbt-value))
