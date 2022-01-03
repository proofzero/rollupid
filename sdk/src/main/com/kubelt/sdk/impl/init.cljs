(ns com.kubelt.sdk.impl.init
  "SDK implementation."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [integrant.core :as ig]
   [taoensso.timbre :as log]))

;; System
;; -----------------------------------------------------------------------------
;; For each key in the system map, if a corresponding method is
;; implemented for the ig/init-key multimethod it will be invoked in
;; order to initialize that part of the system. The return value is
;; stored as part of the system configuration map. Initialization is
;; performed recursively, making it possible to have nested subsystems.
;;
;; If methods are defined for the ig/halt-key! multimethod, they are
;; invoked in order to tear down the system in the reverse order in
;; which it was initialized.
;;
;; To begin the system:
;;   (integrant.core/init)
;; To stop the system:
;;   (integrant.core/halt!)
;;
;; Cf. https://github.com/weavejester/integrant.

(def system
  {;; Our connection to IPFS. Uses the ipfs-http-client from node.
   :adapter/ipfs {}
   ;; Our connection to the Kubelt p2p system.
   :client/p2p {}})

;; :adapter/ipfs
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :adapter/ipfs [_ value]
  (log/debug "init IPFS adapter")
  {:client/ipfs :fixme})

(defmethod ig/halt-key! :adapter/ipfs [_ client]
  (log/debug "halt IPFS adapter"))

;; :client/p2p
;; -----------------------------------------------------------------------------

(defmethod ig/init-key :client/p2p [_ value]
  (log/debug "init p2p client")
  {:client/p2p :fixme})

(defmethod ig/halt-key! :client/p2p [_ value]
  (log/debug "halt p2p client"))

;; Public
;; -----------------------------------------------------------------------------

(defn init
  "Initialize the SDK."
  [{:keys [logging/min-level]}]
  ;; Initialize the logging system.
  (when min-level
    (log/merge-config! {:min-level min-level}))
  ;; NB: If we provide an additional collection of keys when calling
  ;; integrant.core/init, only those keys will be initialized.
  (let [sys-map (ig/init system)]
    sys-map))

(defn halt!
  "Clean-up resources used by the SDK."
  [sys-map]
  (ig/halt! sys-map))
