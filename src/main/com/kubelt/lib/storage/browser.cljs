(ns com.kubelt.lib.storage.browser
  "Support for HTTP requests from a browser execution context."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.lib.promise :refer [promise]]
   [com.kubelt.proto.storage :as proto.storage]
   [com.kubelt.spec.storage :as spec.storage]))

(defrecord Storage []
  proto.storage/Storage
  (init! [this]
    "inititalised"))
