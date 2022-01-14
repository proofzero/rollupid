(ns com.kubelt.sdk.impl.http.node
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
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.sdk.proto.http :as proto.http]
   [com.kubelt.sdk.spec.http :as spec.http]))


(defn request->method
  "Return the request method from a request map in the format expected by
  the Node.js http package."
  [m]
  {:pre [(map? m)]}
  (str/upper-case (name (:http/method m))))

(defn request->host
  [m]
  (:http/host m))

(defn request->port
  [m]
  (:http/port m))

(defn request->path
  [m]
  (:http/path m))

(defn request->options
  "Convert a Kubelt HTTP request map into a Node.js http(s) request
  options map."
  [m]
  (let [method (request->method m)
        host (request->host m)
        port (request->port m)
        path (request->path m)]
    #js {"method" method
         "hostname" host
         "port" port
         "path" path}))

(defn on-response
  [res]
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
;; TODO convert resposne to response map
;; TODO validate reponse map
;; TODO return a channel

(defrecord HttpClient []
  proto.http/HttpClient
  (request!
    [this m]
    {:pre [(malli/validate spec.http/request m)]}
    (let [options (request->options m)
          ;; Use https here if TLS required.
          request (.request http options on-response)]
      (doto request
        (.on "error" on-error)
        ;;(.write data)
        (.end)))))
