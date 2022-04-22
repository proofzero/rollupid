(ns com.kubelt.spec.config
  "Schema for SDK configuration data."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as m])
  (:require
   [com.kubelt.spec.http :as spec.http]
   [com.kubelt.spec.wallet :as spec.wallet]))

;; We use the default vector-based format for ease of authoring, but if
;; performance issues arise it may be more efficient to switch to
;; the "Schema AST" map-based syntax instead as that should be faster to
;; instantiate for large schemas.

;; Note that we can use the (malli.core/properties) function to retrieve
;; metadata associated with a schema, e.g.
;;
;; (malli.core/properties
;;   [:and
;;    {:docs "An example map"
;;     :example {}}
;;    :map])
;; => {:docs "An example map" :example {}}

(def logging-level
  "Logging levels defined by the timbre logging library."
  [:and
   {:default :info}
   [:enum :log :trace :debug :info :warn :error :fatal]])

(def credentials
  [:and
   {:description "A map from core name to JWT strings."
    :example {"0x123abc" "<header>.<payload>.<signature>"}}
   ;; TODO flesh this out
   [:map-of :string :string]])

(def storage
  [:and
   {:description "FIXME"}
   :map])

;; config
;; -----------------------------------------------------------------------------
;; Specifies the configuration map passed to the sdk/init function.

;; A spec for the SDK intialization map where all values are
;; optional. We provide defaults for those options that aren't provided.
(def optional-sdk-config
  [:map {:closed true
         :title ::optional-sdk-config}
   [:log/level {:optional true} logging-level]
   [:credential/jwt {:optional true} credentials]
   [:crypto/wallet {:optional true} spec.wallet/wallet]
   [:ipfs.read/scheme {:optional true} spec.http/scheme]
   [:ipfs.read/host {:optional true} spec.http/host]
   [:ipfs.read/port {:optional true} spec.http/port]
   [:ipfs.write/scheme {:optional true} spec.http/scheme]
   [:ipfs.write/host {:optional true} spec.http/host]
   [:ipfs.write/port {:optional true} spec.http/port]
   [:p2p/scheme {:optional true} spec.http/scheme]
   [:p2p/host {:optional true} spec.http/host]
   [:p2p/port {:optional true} spec.http/port]
   [:platform/storage {:optional true} storage]])

;; After default options and user-supplied options are combined, we
;; should have an SDK configuration options map that has every value
;; provided.
(def sdk-config
  (into [:map {:closed true
               :title ::sdk-config}]
        (map #(assoc-in % [1 :optional] false)
             (m/-children (m/schema optional-sdk-config nil)))))

(def system-config
  [:map {;;:closed false
         :title ::system-config}
   [:log/level {:optional false} logging-level]])
