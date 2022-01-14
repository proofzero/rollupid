(ns com.kubelt.sdk.proto.http
  "A protocol for making HTTP requests."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

(defprotocol HttpClient
  "A simple data-first HTTP client."
  (request! [this m]
    "Performs an HTTP request described by the given request map, returning a core.async channel from which the response may be taken."))
