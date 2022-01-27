(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [taoensso.timbre :as log]))


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
            (assoc-in ctx [:response :http/status] 200))})

(def get-value-for-kbtname
  {:name ::get-value-for-kbtname
   :enter (fn [ctx]
            (log/info {:log/msg "enter get-value-for-kbtname"})
            ctx)
 
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



