(ns com.kubelt.lib.storage
  "Configuration storage."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as malli])
  (:require
   [com.kubelt.spec.storage :as spec.storage])
  (:require
   #?@(:node [[com.kubelt.lib.storage.node :as storage.node]]
       :browser [[com.kubelt.lib.storage.browser :as storage.browser]]
       :jvm [[com.kubelt.lib.storage.jvm :as storage.jvm]])))

;; storage?
;; -----------------------------------------------------------------------------

(defn storage?
  "Returns true if the given value is a map with a storage type tag, and
  false otherwise."
  [x]
  (and
   (map? x)
   (= :kubelt.type/storage (get x :com.kubelt/type))))

;; valid?
;; -----------------------------------------------------------------------------

(defn valid?
  "Return true if the given value conforms to the schema for a storage
  capabililty map, and false otherwise."
  [x]
  (malli/validate spec.storage/storage x))

;; create
;; -----------------------------------------------------------------------------
;; TODO should we split into separate init/create calls?

(defn create
  "Create a platform-appropriate configuration storage. This initializes
  the storage and returns a wrapper that may be injected into the SDK
  init fn as a dependency to allow for SDK state to be stored and
  retrieved."
  [app-name]
  {:pre [(string? app-name)]}
  #?(:browser (storage.browser/create app-name)
     :jvm (storage.jvm/create app-name)
     :node (storage.node/create app-name)))
