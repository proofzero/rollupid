(ns com.kubelt.lib.storage.node
  "Support for storage in a Node.js execution context."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as str])
  (:require
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
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
