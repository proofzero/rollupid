(ns com.kubelt.proto.http
  "A protocol for making HTTP requests."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

(defprotocol HttpClient
  "A simple data-first HTTP client."
  (request! [this m]
    "Performs an HTTP request described by the given request map, returning a core.async channel from which the response may be taken.")
  (request-sync [this request]
    "Performs a synchronous HTTP request described by given request map,
returning the response body directly." )
  (request-cb [this request on-response]
    "Performs an HTTP request described by given request map, invoking the given callback on completion."))
