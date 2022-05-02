(ns com.kubelt.sdk.v1
  "Defines the interface of the Kubelt SDK, v1."
  {:copyright "©2022 Proof Zero Inc" :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.config.sdk :as lib.config.sdk]
   [com.kubelt.lib.config.system :as lib.config.system]
   [com.kubelt.lib.config.util :as lib.config.util]
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.init :as lib.init]
   [com.kubelt.lib.promise :as lib.promise :refer [promise?]]))

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
   {:post (promise? %)}
   (init {}))

  ;; The 1-arity implementation expects a configuration map.
  ([config]
   {:pre [(map? config)]}
   ;; Check that the user-provided options map is valid. If not, an
   ;; error map is returned. Note that these configuration options are
   ;; not required, so we provide defaults for those values that aren't
   ;; provided.
   (let [system-config (lib.config.system/config->system config)]
     (lib.promise/promise
      (fn [resolve reject]
        (lib.init/init system-config resolve reject))))))

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
   (init-js #js{}))

  ;; The 1-arity implementation uses expects a configuration object.
  ([config]
   {:pre [(object? config)] :post [(promise? %)]}
   (let [config (lib.config.util/obj->map config)]
     (-> (init config)
         ;; If an error occurred, convert the returned error map into an
         ;; JavaScript object.
         (lib.promise/catch
          (fn [e]
            (clj->js e)))))))

;; halt
;; -----------------------------------------------------------------------------

(defn halt!
  "Shutdown the SDK. Takes the system description returned by
  calling (init) as the system to halt. Returns a promise/future that
  resolves when the shutdown is complete, or rejects with an error map
  describing the problem that occurred."
  [system]
  {:pre [(map? system)]}
  (lib.promise/promise
   (fn [resolve reject]
     (let [result (lib.init/halt! system)]
       (if-not (lib.error/error? result)
         (resolve result)
         (reject result))))))

(defn halt-js!
  "Shutdown the SDK from a JavaScript context. Takes the system
  description returned by calling (init) as the system to halt."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (-> (halt! system)
      (lib.promise/catch
          (fn [e]
            (clj->js e)))))

;; options
;; -----------------------------------------------------------------------------

(defn options
  "Return the options map representing the SDK state, allowing for the SDK
  to be re-instantiated."
  [system]
  {:pre [(map? system)]}
  (lib.promise/promise
   (fn [resolve reject]
     (let [result (lib.config.sdk/options system)]
       (if-not (lib.error/error? result)
         (resolve result)
         (reject result))))))

(defn options-js
  "Return an options object for the SDK from a JavaScript context."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (-> (options system)
      (lib.promise/then
       (fn [m]
         (clj->js m)))
      (lib.promise/catch
          (fn [e]
            (clj->js e)))))
