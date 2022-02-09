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

            (p2p.handlerequest/user-namespace ctx))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def validate-jwt
  {:name ::validate-jwt
   :enter (fn [ctx]
            ;; TODO extract and validate JWT. Throw an error to
            ;; interrupt chain processing if token is invalid.

            (p2p.handlerequest/validate-jwt ctx))

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
            (let [newctx (p2p.handlerequest/kbt-resolve ctx)]
              newctx))
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

;; TODO extract payload from JWT
(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (log/info {:log/msg "hereiam1"})
            (try
              (let [newctx (p2p.handlerequest/kbt-update ctx)]
                newctx)
              (catch js/Error e (prn e))))

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
