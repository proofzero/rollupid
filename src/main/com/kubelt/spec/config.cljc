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
  [:re #?(;; cljs can't generate re values  so providing a default one
          :cljs {:gen/fmap (fn [_] "/ip4/127.0.0.1/tcp/5001")}
          ;; TODO: add test.check dependency, required for clj env
          :clj {})
   #"^(/(\w+)/(\w+|\.)+)+$"])

(def credentials
  [:and
   {:description "A map from core name to JWT strings."
    :example {"0x123abc" "<header>.<payload>.<signature>"}}
   ;; TODO flesh this out
   [:map-of :string :string]])

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
   [:ipfs.read/multiaddr {:optional true} multiaddr]
   [:ipfs.read/scheme {:optional true} spec.http/scheme]
   [:ipfs.write/multiaddr {:optional true} multiaddr]
   [:ipfs.write/scheme {:optional true} spec.http/scheme]
   [:p2p/multiaddr {:optional true} multiaddr]
   [:p2p/scheme {:optional true} spec.http/scheme]])

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

#_(def config-schema
  "Schema for SDK configuration map."
  [:and
   ;; Assign properties to the schema that can be retrieved
   ;; using (m/properties schema).
   {:title "Configuration"
    :description "The SDK configuration map"
    :example {:log/level :info}}
   sdk-config])
