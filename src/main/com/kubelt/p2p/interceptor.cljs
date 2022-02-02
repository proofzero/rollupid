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
                  (.then (fn [kbt-value-map]
                             (let [kbt-value (str (get (js->clj kbt-value-map :keywordize-keys true) :value))]
                           (if-not (nil? kbt-value)
                             (do
                               (log/info {:log/msg "found name"
                                          :kbt/name kbt-name
                                          :kbt/value kbt-value})
                               (let [body {:name kbt-name :value kbt-value}]
                                 (assoc-in ctx [:response :http/body] body)))
                             ;; No result found, return a 404.
                             (assoc-in ctx [:response :http/status] http.status/not-found))))))))
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
(comment
(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (log/trace {:log/msg "enter kbt-update"})
            ctx)
   :leave (fn [ctx]
            (log/trace {:log/msg "leaving kbt-update"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})
)
  (def kbt-update
    {:name ::kbt-update
;;     :enter (fn [ctx]
     :enter (fn [{:keys [match p2p/hyperbee] :as ctx}]
              (log/info {:log/msg "enter kbt update"})
              (log/info {:log/msg (get ctx :request)})

              ;; get relevant values from request
              (let [reqmap (get ctx :request)
                  kbt-name (get-in match [:path-params :id])
                  kbt-value (get-in match [:path-params :endpoint])
                  hyperbee (get ctx :p2p/hyperbee)]
                    

                (log/info {:log/msg kbt-name})
                (log/info {:log/msg kbt-value})
                (log/info {:log/msg (get ctx :p2p/hyperbee)})

                (-> (.put hyperbee kbt-name kbt-value)
                    (.then (fn [kbt-save-result] 
                             (log/info kbt-save-result)
                             ))))

              ctx)
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
