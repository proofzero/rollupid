(ns com.kubelt.lib.http
  "Cross-platform HTTP client."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   #?@(:browser [[com.kubelt.lib.http.browser :as http]]
       :node [[com.kubelt.lib.http.node :as http]]
       :clj [[com.kubelt.lib.http.jvm :as http]])))

;; client
;; -----------------------------------------------------------------------------
;; TODO accept options.

(defn client
  "Return an HTTP client that conforms to the
  com.kubelt.proto.http/HttpClient protocol."
  []
  (http/->HttpClient))
