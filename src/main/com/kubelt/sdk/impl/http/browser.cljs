(ns com.kubelt.sdk.impl.http.browser
  "Support for HTTP requests from a browser execution context."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require-macros
   [cljs.core.async.macros :refer [go]])
  (:require
   [cljs.core.async :refer [<!]])
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.sdk.proto.http :as proto.http]
   [com.kubelt.sdk.spec.http :as spec.http]))


;; Public
;; -----------------------------------------------------------------------------

(defrecord HttpClient []
  proto.http/HttpClient
  (request!
    [this m]
    {:pre [(malli/validate spec.http/request m)]}
    (prn m)
    ;; TODO return a channel
    ))
