(ns com.kubelt.lib.storage.jvm
  "Support for storage in a jvm execution context"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.core.async :as async :refer [>! go]]
   [clojure.string :as str]
   [com.kubelt.lib.json :as lib.json])
  (:require
   [camel-snake-kebab.core :as csk]
   [jsonista.core :as json]
   [malli.core :as malli]
   [malli.error :as me]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.proto.storage :as proto.storage]
   [com.kubelt.spec.storage :as spec.storage]))

(defrecord Storage []
  proto.storage/Storage
  (init! [this]
    "inititalised"))
