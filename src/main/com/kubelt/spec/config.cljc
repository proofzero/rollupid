(ns com.kubelt.spec.config
  "Schema for SDK configuration data."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as m])
  (:require
   [com.kubelt.spec.http :as spec.http]
   [com.kubelt.spec.storage :as spec.storage]
   [com.kubelt.spec.vault :as spec.vault]
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

(def app-name
  "An application name, preferable reverse-TLD namespaced."
  [:and
   {:example "com.example.foo-app"}
   :string])

(def credentials
  [:and
   {:description "A map from core name to JWT strings."
    :example {"0x123abc" "<header>.<payload>.<signature>"}}
   ;; TODO flesh this out in com.kubelt.spec.jwt
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
   [:app/name {:optional true} app-name]
   [:config/storage {:optional true} spec.storage/storage]
   [:credential/jwt {:optional true} spec.vault/vault-tokens*]
   [:crypto/wallet {:optional true} spec.wallet/wallet]
   [:ipfs.read/scheme {:optional true} spec.http/scheme]
   [:ipfs.read/host {:optional true} spec.http/host]
   [:ipfs.read/port {:optional true} spec.http/port]
   [:ipfs.write/scheme {:optional true} spec.http/scheme]
   [:ipfs.write/host {:optional true} spec.http/host]
   [:ipfs.write/port {:optional true} spec.http/port]
   [:oort/scheme {:optional true} spec.http/scheme]
   [:oort/host {:optional true} spec.http/host]
   [:oort/port {:optional true} spec.http/port]])

;; After default options and user-supplied options are combined, we
;; should have an SDK configuration options map that has every value
;; provided.
(def sdk-config
  (let [;; These keys remain optional; if not provided by the user, we
        ;; initialize their values to platform defaults in lib.init.
        excluded-keys #{:config/storage :crypto/wallet}]
    (into [:map {:closed true
                 :title ::sdk-config}]
          (map (fn [[k _ :as x]]
                 (if-not (contains? excluded-keys k)
                   (assoc-in x [1 :optional] false)
                   x))
               (m/-children (m/schema optional-sdk-config nil))))))

(def system-config
  [:map {;;:closed false
         :title ::system-config}
   [:log/level {:optional false} logging-level]])

(def stored-system-config
  (into [:map {:closed true
               :title ::stored-system-config}]
        (m/-children (m/schema sdk-config nil))))

;; temporary redef :credential/jwt
(def restored-system
  (let [excluded-keys #{:credential/jwt}]
    (into [:map {:closed true
                 :title ::restored-system}
           [:credential/jwt {:optional false} :map] ;; TODO? empty map
           [:crypto/session {:optional false} spec.vault/vault]
           [:client/http {:optional false} any?] ;; TODO spec client type
           [:client/oort {:optional false}
            [:map
             [:http/scheme [:enum :https :http]]
             [:http/host :string]
             [:http/port int?]]]]
          (filter (fn [[k]]
                    (not (contains? excluded-keys k)))
                  (m/-children (m/schema sdk-config nil))))))
