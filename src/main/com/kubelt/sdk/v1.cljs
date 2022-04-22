(ns com.kubelt.sdk.v1
  "Defines the interface of the Kubelt SDK, v1."
  {:copyright "©2022 Proof Zero Inc" :license "Apache 2.0"}
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.lib.config.opts :as lib.config.opts]
   [com.kubelt.lib.config.system :as lib.config.system]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.init :as lib.init]
   [com.kubelt.lib.promise :refer [promise promise?]]
   [com.kubelt.spec.config :as spec.config])
  (:require-macros [com.kubelt.spec :as kspec]))

;; All of the namespaces under sdk.v1 expose interface functions, and
;; don't implement any business logic. Instead, they call methods under
;; sdk.impl to do their work.
;;
;; The methods exposed as part of the SDK API must all:
;; - use (malli) schemas to check inputs and outputs
;; - work with inputs provided as either JavaScript or ClojureScript
;;   data
;; - generate outputs in a suitable format for the caller's execution
;;   context, i.e. JavaScript or ClojureScript

;; init
;; -----------------------------------------------------------------------------

(defn init
  "Initialize the SDK. Accepts an optional configuration map and returns
  an SDK instance."
  ;; The 0-arity implementation uses the default configuration.
  ([]
   (init {}))
  ;; The 1-arity implementation expects a configuration map.
  ([config]
   {:pre [(map? config)] :post [(map? %)]}
   (kspec/conform
    spec.config/optional-sdk-config config
    (let [sdk-config (merge lib.config.opts/sdk-defaults config)]
      (kspec/conform
       spec.config/sdk-config sdk-config
       (let [system-config (lib.config.system/config lib.config.system/default sdk-config)]
         (kspec/conform
          spec.config/system-config system-config
          (lib.init/init system-config))))))))

;; We deliberately resolve a ClojureScript data structure, without
;; converting to a JavaScript object. The returned system description is
;; intended to be an opaque handle, not something to be interacted with
;; from the calling context.
(defn init-js
  "Initialize the SDK from JavaScript context. Accepts an optional
  configuration map and returns an SDK instance."
  ;; The 0-arity implementation uses the default configuration.
  ([]
   {:post [(promise? %)]}
   (promise
    (fn [resolve reject]
      (let [result (init)]
        (if (lib.error/error? result)
          (reject (clj->js result))
          (resolve result))))))

  ;; The 1-arity implementation uses expects a configuration object.
  ([config]
   {:pre [(object? config)] :post [(promise? %)]}
   (let [config (lib.config.opts/obj->map config)]
     (promise
      (fn [resolve reject]
        (let [result (init config)]
          (if (lib.error/error? result)
            (reject (clj->js result))
            (resolve result))))))))

;; halt
;; -----------------------------------------------------------------------------

(defn halt!
  "Shutdown the SDK. Takes the system description returned by
  calling (init) as the system to halt."
  [system]
  {:pre [(map? system)]}
  (if-not (lib.error/error? system)
    (lib.init/halt! system)
    true))

(defn halt-js!
  "Shutdown the SDK from a JavaScript context. Takes the system
  description returned by calling (init) as the system to halt."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (promise
   (fn [resolve reject]
     (let [result (halt! system)]
       (if (lib.error/error? result)
         (reject (clj->js result))
         (resolve result))))))

;; options
;; -----------------------------------------------------------------------------

(defn options
  "Return the options map representing the SDK state, allowing for the SDK
  to be re-instantiated."
  [system]
  {:pre [(map? system)]}
  (lib.config.system/hidrate-options system))

(defn options-js
  "Return an options object for the SDK from a JavaScript context."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (promise
   (fn [resolve reject]
     (let [result (options system)]
       (if (lib.error/error? result)
         (reject (clj->js result))
         (resolve (clj->js result)))))))
