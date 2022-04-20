(ns com.kubelt.spec.config
  "Schema for SDK configuration data."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.http :as spec.http]
   [com.kubelt.spec.wallet :as spec.wallet]))

;; We use the default vector-based format for ease of authoring, but if
;; performance issues arise it may be more efficient to switch to
;; the "Schema AST" map-based syntax instead as that should be faster to
;; instantiate for large schemas.

(def logging-level
  "Logging levels defined by the timbre logging library."
  [:and
   {:default :info}
   [:enum :log :trace :debug :info :warn :error :fatal]])

;; TODO move into com.kubelt.spec.network
#_(def dotted-quad
  #"^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$")

(def dotted-quad
  #"(\\.|\\d)*")

;; TODO refine this regex to better match a multiaddr
;; TODO move into com.kubelt.spec.multiaddr
(def multiaddr
  [:re #"^(/(\w+)/(\w+|\.)+)+$"])

(def credentials
  [:and
   {:description "A map from core name to JWT strings."
    :example {"0x123abc" "<header>.<payload>.<signature>"}}
   ;; TODO flesh this out
   [:map-of :string :string]])

;; config
;; -----------------------------------------------------------------------------
;; Specifies the the configuration map passed to the sdk/init function.

(def config
  [:map {:closed true}
   [:log/level {:optional true} logging-level]
   [:credential/jwt {:optional true} credentials]
   [:crypto/wallet {:optional true} spec.wallet/wallet]
   [:ipfs/read {:optional true} multiaddr]
   [:ipfs.read/scheme {:optional true} spec.http/scheme]
   [:ipfs/write {:optional true} multiaddr]
   [:ipfs.write/scheme {:optional true} spec.http/scheme]
   [:p2p/read {:optional true} multiaddr]
   [:p2p.read/scheme {:optional true} spec.http/scheme]
   [:p2p/write {:optional true} multiaddr]
   [:p2p.write/scheme {:optional true} spec.http/scheme]])

(def config-schema
  "Schema for SDK configuration map."
  [:and
   ;; Assign properties to the schema that can be retrieved
   ;; using (m/properties schema).
   {:title "Configuration"
    :description "The SDK configuration map"
    :example {:logging/min-level :info}}
   config])
