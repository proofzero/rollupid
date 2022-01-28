(ns com.kubelt.p2p.execute
  "Exploratory work towards using reitit.http."
  (:require
   [reitit.interceptor :as interceptor]
   [sieppari.core :as sieppari]
   [sieppari.queue :as queue]))

;; Exploration of using reitit.http, ring-handler, etc. rather than
;; reitit.core.
(comment
  [reitit.http :as route]

  ["/health"
   ["/live"
    {:name ::liveness-check
     :interceptors [p2p.interceptor/status-ok]}]
   ;; TODO kubernetes readiness check
   ["/ready"
    {:name ::readiness-check
     :interceptors [p2p.interceptor/example p2p.interceptor/status-ok]
     :get {:interceptors [p2p.interceptor/example]}}]]

  (let [default-handler (fn [request]
                          {:body "xxx" :status 200})
        route-table (route/router routes)
        ;; Optional sequence of interceptors run before any other
        ;; interceptors, even for the default handler.
        ;; TODO good place to authenticate requests, etc.
        interceptors []]
    (prn (goog.object/getKeys route-table))
    ;;(prn (type (first (goog.object/get route-table "routes"))))
    (try
      (route/ring-handler
       route-table
       #_default-handler
       {:executor p2p.execute/executor
        :interceptors interceptors})
      (catch js/Error e
        (prn e))))

  (extend-type js/Object
    reitit.interceptor/IntoInterceptor
    (into-interceptor [this data opts]
      (let []
        (reitit.interceptor/map->Interceptor
         {:name ::fixme
          :enter (fn [ctx]
                   (prn "compiled")
                   ctx)}))))

  (let [request {:request-method request-method :uri request-path}
        result (api request)]
    ))

(def executor
  (reify
    interceptor/Executor
    (queue [_ interceptors]
      (queue/into-queue
       (map
        (fn [{::interceptor/keys [handler] :as interceptor}]
          (or handler interceptor))
        interceptors)))
    ;; This arity doesn't appear to be supported in CLJS.
    ;; We should support it, passing in our default callbacks.
    #_(execute [_ interceptors request]
        (sieppari/execute interceptors request))
    (execute [_ interceptors request respond raise]
      (sieppari/execute-context interceptors request respond raise))))
