(ns com.kubelt.lib.http.node
  "Support for HTTP requests from a Node.js execution context."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["http" :as http]
   ["https" :as https])
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :refer [<!]]
   [clojure.string :as str])
  (:require
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.http.request :as http.request]
   [com.kubelt.proto.http :as proto.http]
   [com.kubelt.spec.http :as spec.http]))


(defn request->method
  "Return the request method from a request map in the format expected by
  the Node.js http package."
  [m]
  {:pre [(map? m)]}
  (str/upper-case (name (:http/method m))))

(defn request->host
  [m]
  {:pre [(map? m)]}
  (:http/host m))

(defn request->port
  [m]
  {:pre [(map? m)]}
  (:http/port m))

(defn request->path
  [m]
  {:pre [(map? m)]}
  (:http/path m))

(defn request->headers
  [m]
  {:pre [(map? m)]}
  (clj->js (:http/headers m)))

(defn request->body
  [m]
  {:pre [(map? m)]}
  (:http/body m))

;; TODO test me
(defn request->options
  "Convert a Kubelt HTTP request map into a Node.js http(s) request
  options map."
  [m]
  {:pre [(map? m)]}
  (let [method (request->method m)
        host (request->host m)
        port (request->port m)
        path (request->path m)
        headers (request->headers m)
        body (request->body m)
        options {:method method
                 :hostname host
                 :port port
                 :path path}]
    (clj->js
     (cond-> options
       ;; body
       (not (nil? body))
       (assoc :body body)
       ;; headers
       (not (nil? headers))
       (assoc :headers headers)))))

(defn on-response
  [res]
  ;; TODO inspect status code
  ;; TODO inspect result type
  ;; TODO decode body
  ;; TODO collect data
  (println (.-statusCode res))
  (.on res "data"
       (fn [d]
         (println "***")
         (println d))))

(defn on-error
  [error]
  (log/error error))

;; Public
;; -----------------------------------------------------------------------------
;; TODO support https/tls
;; TODO support request headers
;; TODO put patch post delete
;; TODO convert response to response map
;; TODO validate response map
;; TODO return a channel

(defrecord HttpClient []
  proto.http/HttpClient
  (request!
    [this m]
    (if (malli/validate spec.http/request m)
      (let [options (request->options m)
            ;; TODO Use https here if TLS required.
            request (.request http options on-response)]
        ;;(prn options)
        (when (http.request/post? m)
          (if-let [data (get m :http/body)]
            (.write request data)))
        (doto request
          (.on "error" on-error)
          (.end)))
      ;; TODO report an error using common error reporting
      ;; functionality.
      (let [explain (-> spec.http/request (malli/explain m) me/humanize)]
        {:com.kubelt/type :kubelt.type/error
         :error explain}))))
