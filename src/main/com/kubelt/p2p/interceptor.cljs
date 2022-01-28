(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.http.status :as http.status]))


(def example
  {:name ::example
   :enter (fn [ctx]
            (log/info {:log/msg "enter"})
            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def status-ok
  {:name ::status-ok
   :leave (fn [ctx]
            (assoc-in ctx [:response :http/status] http.status/ok))})

(def status-no-content
  {:name ::status-ok
   :leave (fn [ctx]
            (assoc-in ctx [:response :http/status] http.status/no-content))})

(def validate-jwt
  {:name ::validate-jwt
   :enter (fn [ctx]
            ;; TODO extract and validate JWT
            ctx)})

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

(def get-value-for-kbtname
  {:name ::get-value-for-kbtname
   :enter (fn [{:keys [id hyper/bee] :as ctx}]
            (log/info {:log/msg "enter get-value-for-kbtname" :kbt/id id})
            (assoc-in ctx [:response :http/body] {:foo "bar"}))

   ;; TODO lookup value in hyperbee for kbtname in request
   ;; TODO return value

   :leave (fn [ctx]
            (log/info {:log/msg "leaving get-value-for-kbtname"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})


(def update-kbt-value
  {:name ::update-kbt-value
   :enter (fn [ctx]
            (log/info {:log/msg "enter update-kbt-value"})
            ctx)

   ;; TODO verify JWT
   ;; TODO extract payload from JWT
   ;; TODO update value in hyperbee for kbtname
   ;; TODO return response

   :leave (fn [ctx]
            (log/info {:log/msg "leaving update-kbt-value"})
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
