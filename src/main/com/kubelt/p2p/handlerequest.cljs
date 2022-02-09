(ns com.kubelt.p2p.handlerequest
  "interceptor business logic" 
  (:import
   [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
   [goog.crypt.base64 :as base64]
   [goog.object])
 
  (:require
    [taoensso.timbre :as log]
    [com.kubelt.lib.http.status :as http.status]
    [com.kubelt.p2p.proto :as p2p.proto]
    [clojure.string :as str]
    [com.kubelt.lib.kdf :as kdf]
    [com.kubelt.lib.jwt :as jwt]
    ))

(defn user-namespace [ctx]
  ;; TODO use hash of pubkey for namespace? 
  (let [pubkey (get (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true) :pubkey)
        hasher (Sha256.)]
    (.update hasher pubkey)
    (let [key-hash (.digest hasher)
          pubkey-hash (.encodeString base64 key-hash goog.crypt.base64.BASE_64_URL_SAFE)]

      ;; TODO 
      ;; set hyperbee ns
      ;;(.sub (get ctx :p2p/hyperbee) pubkey-hash)

      )) ctx)

(defn validate-jwt [ctx]

  (let [payload (get ctx :body/raw) ;; TODO retrieve from request
        decoded (jwt/decode payload)
        pubkey (str (.-pubkey decoded))]
    (let [jwt-valid (jwt/verify payload pubkey)] 
      (-> ctx
          (assoc-in [:request :jwt/raw] payload)
          (assoc-in [:request :jwt/pubkey] pubkey)
          (assoc-in [:request :jwt/valid] jwt-valid)))))

(defn kbt-resolve [ctx] 

  (let [request (get ctx :request)
        ;; Context has a :match key containing the routing
        ;; table match data.
        hyperbee (get ctx :p2p/hyperbee)
        match (get ctx :match)
        kbt-name (get-in match [:path-params :id])]
    ;; The Hyperbee .get() request returns a promise. Note
    ;; that js/Promise is an AsyncContext, so execution pauses
    ;; until the promise resolves.
    (-> (p2p.proto/query hyperbee kbt-name)
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
                         (assoc-in ctx [:response :http/body] body)))
                     ;; No result found, return a 404.
                     (assoc-in ctx [:response :http/status] http.status/not-found))))))))

(defn kbt-update [ctx]
  (let [request (get ctx :request)
        hyperbee (get ctx :p2p/hyperbee)
        match (get ctx :match)
        kbt-name (get-in match [:path-params :id])
        kbt-value  (get (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true) :endpoint)]


    (-> (p2p.proto/store hyperbee kbt-name kbt-value)
        (.then (fn []
                 (assoc-in ctx [:response :http/status] http.status/created))))))
