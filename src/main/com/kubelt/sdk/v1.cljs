(ns com.kubelt.sdk.v1
  "Defines the interface of the Kubelt SDK, v1."
  {:copyright "©2022 Proof Zero Inc" :license "Apache 2.0"}
  (:require
   [malli.core :as m]
   [malli.error :as me])
  (:require
   [com.kubelt.lib.config :as lib.config]
   [com.kubelt.lib.config.default :as lib.config.default]
   [com.kubelt.lib.config.sdk :as lib.config.sdk]
   [com.kubelt.lib.config.system :as lib.config.system]
   [com.kubelt.lib.error :as lib.error :refer [conform*] :refer-macros [conform*]]
   [com.kubelt.lib.init :as lib.init]
   [com.kubelt.lib.promise :as lib.promise :refer [promise?]]
   [com.kubelt.spec.config :as spec.config])
  (:require-macros
   [com.kubelt.spec :as kspec]))

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
   {:pre [(map? config)] :post [(promise? %)]}
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
   (let [config (lib.config/obj->map config)]
     (-> (init config)
         ;; If an error occurred, convert the returned error map into an
         ;; JavaScript object.
         (lib.promise/catch
          (fn [e]
            (lib.promise/rejected (clj->js e))))))))

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
  {:pre [(map? system)] :post [(promise? %)]}
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

;; store
;; -----------------------------------------------------------------------------

(defn store&
  "Store the state of the system using the platform storage capability
  that was injected (or provided by default) during SDK
  initialization. We only care about preserving state that can't be
  recreated or are costly to recreate, e.g. JWTs. Returns a promise that
  resolves to a map of the stored state once complete."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (let [;; We'll store the options that were used to initialize the SDK
        ;; so we can reinitialize a new instance.
        init-options& (options system)
        ;; This function provides a platform specific means of storing
        ;; a (small) data map.
        store-fn (get-in system [:config/storage :storage/store-fn])
        ;; Get the JWTs currently owned by the SDK instance.
        vault (get system :crypto/session)]
    ;; TODO move into library utility.
    (-> init-options&
        (lib.promise/then
         (fn [options]
           ;; Construct the state map to store.
           (let [;; options can't include fns if we are to serialize it!
                 options (-> options
                             (dissoc :config/storage)
                             (dissoc :crypto/wallet))
                 state {:options options :vault vault}]
             ;; Returns a promise that resolves when the writing is
             ;; finished.
             (store-fn state)))))))

(defn store-js&
  "Store the state of the system in a platform-specific way."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  ;; We don't have any arguments to convert from JSON to edn, so we just
  ;; invoke store& directly.
  (store& system))

;; restore
;; -----------------------------------------------------------------------------

(defn restore&
  "Return a promise that resolves to a system map that has had saved state
  restored."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  (let [;; This function provides a platform specific means of restoring
        ;; a (small) data map.
        restore-fn (get-in system [:config/storage :storage/restore-fn])
        ;; Resolves to the data that has been restored.
        restore& (restore-fn)]
    (-> restore&
        (lib.promise/then
         (fn [{:keys [options vault]}]
           ;; TODO fold options back into system map?
           (let [session vault
                 wallet {:com.kubelt/type :kubelt.type/wallet
                         :wallet/address (-> vault :vault/tokens keys first)}
                 restored-system (assoc system
                                        :crypto/session session
                                        :crypto/wallet wallet)]
             ;; TODO restore this check of the restored SDK against a schema
             restored-system
             #_(conform*
              [spec.config/restored-system restored-system]
              restored-system)))))))

(defn restore-js&
  "Returns a promise that resolves to a system map that has had saved
  state restored. This function is expected to be invoked from a
  JavaScript context."
  [system]
  {:pre [(map? system)] :post [(promise? %)]}
  ;; We don't have any arguments to convert from JSON to edn, so we just
  ;; invoke restore& directly.
  (-> (restore& system)
      (lib.promise/then
       (fn [sys]
         (if (lib.error/error? sys)
           ;; Convert the error into an object for inspection in the
           ;; calling context.
           (clj->js sys)
           sys)))))
