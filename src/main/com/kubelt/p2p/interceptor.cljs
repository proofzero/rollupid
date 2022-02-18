(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 base64])
  (:require
    [goog.crypt.base64 :as base64]
    [goog.object])
  (:require
    [taoensso.timbre :as log]
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [com.kubelt.p2p.proto :as p2p.proto]
    [com.kubelt.p2p.handlerequest :as p2p.handlerequest]
    [com.kubelt.lib.jwt :as jwt]
    [clojure.string :as str])
  (:require
    [com.kubelt.lib.http.status :as http.status]))


(def status-ok
  {:name ::status-ok
   :leave (fn [ctx]
            ;; If status is already set, nothing to do.
            (if-let [status (get-in ctx [:response :http/status])]
              ctx
              (assoc-in ctx [:response :http/status] http.status/ok)))})

(def status-no-content
  {:name ::status-no-content
   :leave (fn [ctx]
            ;; If status is already set, nothing to do.
            (if-let [status (get-in ctx [:response :http/status])]
              ctx
              (assoc-in ctx [:response :http/status] http.status/no-content)))})
(def user-namespace
  {:name ::user-namespace
   :enter (fn [ctx]
            (let [validated (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true)
                  pubkey (get-in  validated [:payload :pubkey])]

              (p2p.handlerequest/set-user-namespace pubkey))
            ctx)

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def validate-jwt
  {:name ::validate-jwt
   :enter (fn [ctx]
            ;; TODO extract and validate JWT. Throw an error to
            ;; interrupt chain processing if token is invalid.
            (let [payload (get ctx :body/raw) ;; TODO retrieve from request
                  pubkey (jwt/get-public-key payload)
                  ;;decoded (jwt/decode payload)
                  ]
              (let [payload (get ctx :body/raw)]
                (-> (p2p.handlerequest/validate-jwt payload )
                    (.then (fn [x] 
                             (-> ctx
                                 (assoc-in [:request :jwt/raw] payload)
                                 (assoc-in [:request :jwt/pubkey] pubkey)
                                 (assoc-in [:request :jwt/valid] x))))))))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})
;; TODO check and throw error

(def register
  {:name ::register
   :enter (fn [ctx]
            ;; TODO register the user
            ctx)})

(def metrics
  {:name ::metrics
   :leave (fn [ctx]
            ;; TODO return accumulated metrics.
            ctx)})

(def version
  {:name ::version
   :leave (fn [ctx]
            (let [version "x.y.z"
                  body {:version version}]
              (assoc-in ctx [:response :http/body] body)))})

;; TODO confirm that an error in the promise chain triggers execution
;; of :error handler; otherwise use .catch().
(def kbt-resolve
  {:name ::kbt-resolve
   :enter (fn [ctx]
            (let [bee (get ctx :p2p/hyperbee)
                  match (get ctx :match)
                  kbt-name (get-in match [:path-params :id])]


              (let [kvresult (p2p.handlerequest/kbt-resolve bee kbt-name)]
                (-> kvresult
                    (.then (fn[x] 
                             (if-not (nil? x)
                               (assoc-in ctx [:response :http/body] x)
                               ;; No result found, return a 404.
                               (assoc-in ctx [:response :http/status] http.status/not-found))))))))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

;; TODO extract payload from JWT
(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (let [request (get ctx :request)
                  hyperbee (get ctx :p2p/hyperbee)
                  match (get ctx :match)
                  kbt-name (get-in match [:path-params :id])
                  valid-jwt (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true)
                  kbt-value  (get-in valid-jwt [:payload :endpoint])]
              (let [
                    update-result (p2p.handlerequest/kbt-update hyperbee kbt-name kbt-value)]
                (-> update-result
                    (.then (fn[x] 
                             (assoc-in ctx [:response :http/status] http.status/created)))))))

   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt update"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def health-ready
  {:name ::health-ready
   :leave (fn [ctx]
            ;; TODO readiness check; set error status if problem.
            ctx)})

(def health-live
  {:name ::health-live
   :leave (fn [ctx]
            ;; TODO liveness check; set error status if problem.
            ctx)})
