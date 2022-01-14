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
  [:enum :platform/node :platform/browser])

(def logging-level
  "Logging levels defined by the timbre logging library."
  [:and
   {:default :info}
   [:enum :log :trace :debug :info :warn :error :fatal]])

(def net-host
  string?)

(def net-port
  int?)

;; config
;; -----------------------------------------------------------------------------
;; Specifies the the configuration map passed to the sdk/init function.

(def config
  [:map
   [:sys/platform platform]
   [:logging/min-level {:optional true} logging-level]
   [:p2p/host {:optional true} net-host]
   [:p2p/port {:optional true} net-port]])

(def config-schema
  "Schema for SDK configuration map."
  [:and
   ;; Assign properties to the schema that can be retrieved
   ;; using (m/properties schema).
   {:title "Configuration"
    :description "The SDK configuration map"
    :example {:logging/min-level :info}}
   config])
