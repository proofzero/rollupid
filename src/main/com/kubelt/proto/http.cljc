(ns com.kubelt.proto.http
  "A protocol for making HTTP requests."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


(defprotocol HttpClient
  "A simple data-first HTTP client."
  (request! [this request]
    "Performs an HTTP request described by the given request map, returning a promise that resolves to the HTTP response."))
