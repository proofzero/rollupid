(ns com.kubelt.p2p.execute
  "Exploratory work towards using reitit.http."
  (:require
   ["http" :as http :refer [IncomingMessage ServerResponse]])
  (:require
   [reitit.core :as route]
   [reitit.interceptor :as interceptor]
   [sieppari.core :as sieppari]
   [sieppari.queue :as queue]
   [taoensso.timbre :as log]
   [cognitect.transit :as transit])
  (:require
   [com.kubelt.lib.http.request :as http.request]
   [com.kubelt.lib.http.status :as http.status]))

;; Media Types
;; -----------------------------------------------------------------------------

(def transit-json
  "application/transit+json")

(def transit-msgpack
  "application/transit+msgpack")

;; Handlers
;; -----------------------------------------------------------------------------
;; TODO support transit as default format
;; TODO support JSON as optional format
;; TODO content negotiation

(comment
  (def r (transit/reader :json))
  (transit/write w [1 2 3])
  (transit/write w {:foo "bar"})
  (transit/read r "[1,2,3]"))

(defn on-complete
  [^ServerResponse res ctx]
  (let [status (-> ctx :response :http/status)
        method (-> ctx :request :http/method)
        ;;message (get http.status/message status)
        request-path (get-in ctx [:request :uri/path])]
    (log/info {:log/msg "request received"
               :request/method method
               :request/path request-path
               :response/status status})
    (if-let [body-edn (get-in ctx [:response :http/body])]
      ;; There's a response body to return; convert it to JSON and set
      ;; the response headers accordingly.
      (let [writer (transit/writer :json)
            response-body (transit/write writer body-edn)
            headers #js {"Content-Type" transit-json}]
        (doto res
          (.writeHead status headers)
          (.end response-body)))
      ;; There's no response body, so set the status only.
      (doto res
        (.writeHeader status)
        (.end)))))

(defn on-error
  [^ServerResponse res ctx]
  ;; TODO
  (log/error "error"))

(defn extract-chain
  "Given a request method and a route table entry, return the chain of
  interceptors to execute."
  [method match-data]
  (letfn [;; Interceptors chains can be added to the route table as a
          ;; vector or map. If provided as a map, the map
          ;; key :interceptors should contain a vector of interceptors
          ;; to use for the route.
          (extract [m method-kw]
            ;; If no interceptor chain is specified for the given
            ;; method, we return an empty vector to signify nothing to
            ;; do.
            (if-some [chain (get m method-kw)]
              (if (map? chain)
                (if-some [interceptors (get chain :interceptors)] interceptors [])
                ;; User supplied a vector of interceptors, return it
                ;; without modification.
                chain)
              []))]
    (let [chain-all (extract match-data :http.method/all)
          method-kw (keyword :http.method method)
          chain-method (extract match-data method-kw)]
      ;; We don't want the presence of an :all chain to indicate that
      ;; all HTTP methods are supported. Instead, the chain is only
      ;; considered "found" if there's a chain corresponding to the
      ;; current request method; in that case we prepend the chain with
      ;; the contents of the :all chain.
      (if (seq chain-method)
        ;; The :all interceptors are always run first (on :enter) and
        ;; last (on :leave), if specified.
        (concat chain-all chain-method)
        []))))

;; TODO move to context utility library.
(defn set-status
  "Set the HTTP status code of the response."
  [ctx status-code]
  (assoc-in ctx [:response :http/status] status-code))

(defn make-request-handler
  [config]
  (let [hyperbee (get config :hyper/bee)
        database (get config :db/memory)
        router (get config :http/router)]
    ;; This handler fn is invoked for each request received. It looks
    ;; for matching route in the route table and if it finds one,
    ;; retrieves the interceptor chain, sets up the request context, and
    ;; triggers the execution of the chain.
    (fn on-request
      [^IncomingMessage req ^ServerResponse res]
      (let [request-map (http.request/req->map req)
            request-method (:http/method request-map)
            request-path (:uri/path request-map)
            context {:request request-map
                     :response {}
                     :p2p/hyperbee hyperbee
                     :p2p/database database}]
        ;; TODO handle match :path-params (+ :path :result :template)
        (if-let [match (route/match-by-path router request-path)]
          (if-let [;; NB: (seq) returns nil for empty collections.
                   int-chain (seq (extract-chain request-method (:data match)))]
            (let [on-complete (partial on-complete res)
                  on-error (partial on-error res)
                  ;; Need to convert for processing by sieppari; doesn't
                  ;; appear to accept a seq.
                  int-chain (into [] int-chain)]
              ;; Execute the interceptor chain, calling either the
              ;; completion or error callbacks.
              (sieppari/execute-context int-chain context on-complete on-error))
            ;; The route was matched but no interceptors found; tell the
            ;; user they requested an unsupported method with a 405
            ;; Method Not Allowed response.
            (let [result (set-status context http.status/method-not-allowed)]
              (on-complete res result)))
          ;; No matching route found, return 404.
          (let [result (set-status context http.status/not-found)]
            (on-complete res result)))))))

;; TEMP
;; -----------------------------------------------------------------------------
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
