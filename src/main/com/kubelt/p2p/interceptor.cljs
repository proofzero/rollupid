(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [goog.object])
  (:require
   [taoensso.timbre :as log]
   [cljs.test :as t :refer [deftest is testing use-fixtures]]

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

(def validate-jwt
  {:name ::validate-jwt
   :enter (fn [ctx]
            ;; TODO extract and validate JWT. Throw an error to
            ;; interrupt chain processing if token is invalid.
            (prn (get-in ctx [:request :http/body]))
            (let [payload "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJrZXkiOiItLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLVxuTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEwRmFqOVdFMGJkcFVvWlJWbGM5VlxuKzdRb0VVT0srcGlYSlFHaCs4MldjZWZWYk1LYkVRWDVvVTFkZ2p1M1gvcXVOSlF4MDVqVU92VXRrZFRZNXlEUVxuaWdVV2tHeHNLR3Z0bGJZdENsWW1ZeFVYeG1UKzZXR3lHZ0xpbzJQczFVRXRFMVlHQWlnczJmcXNKaWdGZ3FhN1xuaDVkRXF1TXo0RkNCd0xlVVBObUczcFBTNDdsaTlXSDdyM2M3WmhjNUNJZmRKcmZXSlJnSzNscVg0WldrdlJEblxuMk14NFA2MTRISTZDR09uVDU1Qjlyd1VmL0tISEJabGZtb1NvUEFXNkdUNkRCR0w0YVNEbjE0UkVSQnkrUE00cVxuL3FKWkhuT3VGdWE4RTByRGNwMjgvZVovS0dhbDg4eFBzVjhZQ2NHYklnSUZ3TUViVFZNRTNrT2c4ZmNTeUZBd1xucVFJREFRQUJcbi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLVxuIiwiZW5kcG9pbnQiOiJiYWZ5eDB4MHgweDB4MCIsImtidG5hbWUiOiJpR1dvUjZkRVNCaE52SGRuU09kRXpkV0Rqamxibm1RbXZZMWpyY2ZVdmZrPSIsImlhdCI6MTY0MzkwNjQ1MywiZXhwIjoxNjQzOTQ5NjUzfQ.y66_Z8AdRkUbu28JJ4P4XtmQ5zZ-SNLckc5FOjSRBEbmyOH3GWFCXRo1I-RvtJB4-qUu8xf8tB-LL3TSxFNzqTJf26We9oNEZ9frlmsYQ6q5F5RWUnaliqtvtDAqBrRxnrfhBEeouTSYaneLEkr5JvmgMN9zu7RHD1p3C2Gj-RMUbVJ55Wk_ur3EO_pkW6EMX8bxwVV6U1z34eZ5hlJ7TWSmL1caaTBlIN-CQ0MPTqx7U7Nd7ZsBGPPFSogDh0cVQJrxiuDhgRFIzm3QeFiT9Gire-asiijgcA_WuBFiOYIRa2N5BGGRlDnpLTMLWnS1p04RH2vx7gnT_3ynmt3T8Q" ;; TODO retrieve from request
                  decoded (jwt/decode payload)
                  pubkey (str (.-pubkey decoded))]
              (let [jwt-valid (jwt/verify payload pubkey)] 
                (-> ctx
                    (assoc-in [:request :jwt/raw] payload)
                    (assoc-in [:request :jwt/pubkey] pubkey)
                    (assoc-in [:request :jwt/valid] jwt-valid))
                
                )))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})



            ;; TODO check and throw error

            ;; TODO add to context 

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
   :enter (fn [{:keys [match p2p/hyperbee] :as ctx}]
            (let [request (get ctx :request)
                  ;; Context has a :match key containing the routing
                  ;; table match data.
                  kbt-name (get-in match [:path-params :id])]
              
              ;; The Hyperbee .get() request returns a promise. Note
              ;; that js/Promise is an AsyncContext, so execution pauses
              ;; until the promise resolves.
              (-> (.get hyperbee kbt-name)
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

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

;; TODO extract payload from JWT
(def kbt-update
  {:name ::kbt-update
   :enter (fn [{:keys [match p2p/hyperbee] :as ctx}]
            
            (let [request (get ctx :request)
                  kbt-name (get-in match [:path-params :id])
                  kbt-value  (get (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true) :endpoint)]

              (log/trace {:log/msg "enter kbt-update" :kbt/name kbt-name :kbt/value kbt-value})

              (-> (.put hyperbee kbt-name kbt-value)
                  (.then (fn []
                           (assoc-in ctx [:response :http/status] http.status/created))))))
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
