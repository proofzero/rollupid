(ns com.kubelt.sdk.spec.config
  "Schema for SDK configuration data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; We use the default vector-based format for ease of authoring, but if
;; performance issues arise it may be more efficient to switch to
;; the "Schema AST" map-based syntax instead as that should be faster to
;; instantiate for large schemas.

(def platform
  "Supported execution environments."
  [:enum :platform.type/node :platform.type/browser :platform.type/jvm])

(def logging-level
  "Logging levels defined by the timbre logging library."
  [:and
   {:default :info}
   [:enum :log :trace :debug :info :warn :error :fatal]])

#_(def dotted-quad
  #"^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$")

(def dotted-quad
  #"(\\.|\\d)*")

;; TODO refine this regex to better match a multiaddr
(def multiaddr
  [:re #"^(/(\w+)/(\w+|\.)+)+$"])

;; config
;; -----------------------------------------------------------------------------
;; Specifies the the configuration map passed to the sdk/init function.

(def config
  [:map {:closed true}
   [:sys/platform {:optional true} platform]
   [:logging/min-level {:optional true} logging-level]
   [:p2p/read {:optional true} multiaddr]
   [:p2p/write {:optional true} multiaddr]])

(def config-schema
  "Schema for SDK configuration map."
  [:and
   ;; Assign properties to the schema that can be retrieved
   ;; using (m/properties schema).
   {:title "Configuration"
    :description "The SDK configuration map"
    :example {:logging/min-level :info}}
   config])
