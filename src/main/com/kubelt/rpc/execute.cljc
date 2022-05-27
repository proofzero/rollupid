(ns com.kubelt.rpc.execute
  "Execute RPC requests."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.proto.http :as proto.http]))

;; execute
;; -----------------------------------------------------------------------------
;; TODO validate result

(defn execute
  "Execute an RPC call using the given HTTP client and a map describing
  the HTTP request to perform. Returns:
  - [clj] a future that may be deref'ed to obtain the result
  - [cljs] a promise that may be resolved to obtain the result"
  [http request]
  (proto.http/request! http request))
