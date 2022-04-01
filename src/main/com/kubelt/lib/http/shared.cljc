(ns com.kubelt.lib.http.shared
  "Shared utilities for cross-platform HttpClient implementations."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]))

(defn request->method
  "Return the request method from a request map in the format expected by
  the Node.js http package."
  [m]
  {:pre [(map? m)]}
  (cstr/upper-case (name (:http/method m))))

(defn request->domain
  [m]
  {:pre [(map? m)]}
  (:uri/domain m))

(defn request->port
  [m]
  {:pre [(map? m)]}
  (:uri/port m))

(defn request->path
  [m]
  {:pre [(map? m)]}
  (:uri/path m))

(defn request->headers
  [m]
  {:pre [(map? m)]}
  (let [headers (get m :http/headers {})]
    headers))

(defn request->body
  [m]
  {:pre [(map? m)]}
  (:http/body m))

(defn request->scheme
  [m]
  {:pre [(map? m)]}
  (name (get m :uri/scheme "")))

;; TODO flesh this out!
(defn request->url
  "Construct a URL from a request map."
  [m]
  {:pre [(map? m)]}
  (let [scheme (request->scheme m)
        domain (request->domain m)
        port (request->port m)
        port (when port
               (str ":" port))
        path (request->path m)
        parts [scheme "://" domain port path]]
    ;; TODO return an error map when needed.
    ;; (lib.error/error "...")
    (cstr/join "" (remove nil? parts))))
