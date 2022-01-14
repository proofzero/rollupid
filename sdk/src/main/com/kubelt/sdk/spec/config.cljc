(ns com.kubelt.sdk.spec.config
  "Schema for SDK configuration data."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; We use the default vector-based format for ease of authoring, but if
;; performance issues arise it may be more efficient to switch to
;; the "Schema AST" map-based syntax instead as that should be faster to
;; instantiate for large schemas.

(def logging-level
  "Logging levels defined by the timbre logging library."
  [:and
   {:default :info}
   [:enum :log :trace :debug :info :warn :error :fatal]])

(def schema
  "Schema for SDK configuration map."
  [:and
   ;; Assign properties to the schema that can be retrieved
   ;; using (m/properties schema).
   {:title "Configuration"
    :description "The SDK configuration map"
    :example {:logging/min-level :info}}
   [:map
    [:logging/min-level {:optional true} logging-level]]])
