(ns com.kubelt.lib.http.shared
  "Shared utilities for cross-platform HttpClient implementations."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]))

(defn request->method
  "Return the request method from a request map in the format expected by
  the Node.js http package."
  [m]
  {:pre [(map? m)]}
  (str/upper-case (name (:http/method m))))

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
  (:http/headers m))

(defn request->body
  [m]
  {:pre [(map? m)]}
  (:http/body m))

(defn request->scheme
  [m]
  ;;  {:pre [(map? m)]}
  ;;  (:uri/scheme m))
  ;; FIXME support both, disabled for testing
  "http")
