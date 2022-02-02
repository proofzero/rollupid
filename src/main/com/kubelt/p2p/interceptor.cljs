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

;; TODO confirm that an error in the promise chain triggers execution
;; of :error handler; otherwise use .catch().
(def kbt-resolve
  {:name ::kbt-resolve
   :enter (fn [{:keys [match p2p/hyperbee] :as ctx}]
            (let [request (get ctx :request)
                  ;; Context has a :match key containing the routing
                  ;; table match data.
                  kbt-name (get-in match [:path-params :id])]
              (log/trace {:log/msg "enter kbt-resolve" :kbt/name kbt-name})
              ;; The Hyperbee .get() request returns a promise. Note
              ;; that js/Promise is an AsyncContext, so execution pauses
              ;; until the promise resolves.
              (-> (.get hyperbee kbt-name)
                  (.then (fn [kbt-value]
                           (if-let [body {:name kbt-name :value kbt-value}]
                             (do
                               (log/info {:log/msg "found name"
                                          :kbt/name kbt-name
                                          :kbt/value kbt-value})
                               (assoc-in ctx [:response :http/body] body))
                             ;; No result found, return a 404.
                             (assoc-in ctx [:response :http/status] http.status/not-found)))))))
   :leave (fn [ctx]
            (log/trace {:log/msg "leaving kbt-resolve"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})


;; TODO verify JWT
;; TODO extract payload from JWT
;; TODO update value in hyperbee for kbtname
;; TODO return response
(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (log/trace {:log/msg "enter update-kbt-value"})
            ctx)
   :leave (fn [ctx]
            (log/info {:log/msg "leaving update-kbt-value"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(comment
  (def kbt-update
    {:name ::kbt-update
     :enter (fn [ctx]
              (log/info {:log/msg "enter kbt update"})

              ;; get relevant values from request
              (let [reqmap (get ctx :request)
                    kbtname (nth (get reqmap :uri/path-components) 2)
                    kbtvalue (nth (get reqmap :uri/path-components) 3)]

                (log/info {:log/msg kbtname})
                (log/info {:log/msg kbtvalue})
                (log/info {:log/msg (get ctx :p2p/hyperbee)})
                (.put (get ctx :p2p/hyperbee) kbtname kbtvalue)
                (doto (get ctx :response)
                  (.writeHead 200 #js {"content-type" "text/html"})
                  (.end (reduce str ["<html><body><h1>SETTING " kbtname " = " kbtvalue " </h1></body></html>"]))))
              ctx)
     :leave (fn [ctx]
              (log/info {:log/msg "leaving kbt update"})
              ctx)
     :error (fn [{:keys [error] :as ctx}]
              (log/error {:log/error error})
              ctx)}))

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
