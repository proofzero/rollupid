(ns com.kubelt.sdk.v1
  "Defines the interface of the Kubelt SDK, v1."
  {:copyright "©2022 Kubelt, Inc" :license "Apache 2.0"}
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.lib.config :as lib.config]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.init :as lib.init]
   [com.kubelt.lib.promise :refer [promise promise?]]
   [com.kubelt.spec.config :as spec.config]))

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
   {:post [(map? %)]}
   (let [config lib.config/default-config]
     (if (m/validate spec.config/config config)
       (lib.init/init config)
       (lib.error/explain spec.config/config config))))

  ;; The 1-arity implementation expects a configuration map.
  ([config]
   {:pre [(map? config)] :post [(map? %)]}
   (if (m/validate spec.config/config config)
     (let [config (merge lib.config/default-config config)]
       (lib.init/init config))
     (lib.error/explain spec.config/config config))))

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
   (let [config (lib.config/obj->map config)]
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
