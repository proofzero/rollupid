(ns com.kubelt.sdk.v1
  "Defines the interface of the Kubelt SDK, v1."
  {:copyright "©2021 Kubelt, Inc" :license "UNLICENSED"}
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.sdk.spec.config :as spec.config]
   [com.kubelt.sdk.impl.config :as impl.config]
   [com.kubelt.sdk.impl.promise :as impl.promise :refer [promise promise?]]
   [com.kubelt.sdk.impl.init :as impl.init]))

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

;; TODO move to error utility namespace.
(defn explain
  "Return human-friendly description of why some value doesn't conform to
  the provided schema."
  [schema value]
  (let [explain (-> schema (m/explain value) me/humanize)]
    {:com.kubelt/type :kubelt.type/error
     :error explain}))

;; TODO move to error utility namespace.
(defn error?
  ""
  [x]
  (and
   (map? x)
   (= :kubelt.type/error (get x :com.kubelt/type))))

;; TODO define catalog of errors
;; TODO use cognitect.anomalies
;; TODO examine truss
;; https://github.com/ptaoussanis/truss

;; init
;; -----------------------------------------------------------------------------

(defn init
  "Initialize the SDK. Accepts an optional configuration map and returns
  an SDK instance."
  ;; The 0-arity implementation uses the default configuration.
  ([]
   {:post [(map? %)]}
   (let [config impl.config/default-config]
     (if (m/validate spec.config/config config)
       (impl.init/init config)
       (explain spec.config/config config))))

  ;; The 1-arity implementation expects a configuration map.
  ([config]
   {:pre [(map? config)] :post [(map? %)]}
   (if (m/validate spec.config/config config)
     (let [config (merge impl.config/default-config config)]
       (impl.init/init config))
     (explain spec.config/config config))))

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
        (if (error? result)
          (reject (clj->js result))
          (resolve result))))))

  ;; The 1-arity implementation uses expects a configuration object.
  ([config]
   {:pre [(object? config)] :post [(promise? %)]}
   (let [config (impl.config/obj->map config)]
     (promise
      (fn [resolve reject]
        (let [result (init config)]
          (if (error? result)
            (reject (clj->js result))
            (resolve result))))))))

;; halt
;; -----------------------------------------------------------------------------

(defn halt!
  "Shutdown the SDK. Takes the system description returned by
  calling (init) as the system to halt."
  [system]
  {:pre [(map? system)]}
  (if-not (error? system)
    (impl.init/halt! system)
    true))

(defn halt-js!
  "Shutdown the SDK from a JavaScript context. Takes the system
  description returned by calling (init) as the system to halt."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (promise
   (fn [resolve reject]
     (let [result (halt! system)]
       (if (error? result)
         (reject (clj->js result))
         (resolve result))))))
