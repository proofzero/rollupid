(ns com.kubelt.lib.config.system
  "SDK system config"
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [com.kubelt.lib.detect :as detect]
   [com.kubelt.lib.vault :as lib.vault]
   [com.kubelt.lib.wallet :as lib.wallet]))

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

(def default
  {;; These empty defaults should be overridden from the SDK init
   ;; options map.
   :log/level nil
   :ipfs/read-addr nil
   :ipfs/read-scheme nil
   :ipfs/write-addr nil
   :ipfs/write-scheme nil
   :p2p/read-addr nil
   :p2p/write-addr nil
   ;; Our common HTTP client.
   :client/http {}
   ;; Our connection to IPFS.
   :client/ipfs {:ipfs/read {:http/scheme :http
                             :ipfs/multiaddr (ig/ref :ipfs/read-addr)}
                 :ipfs/write {:http/scheme :http
                              :ipfs/multiaddr (ig/ref :ipfs/write-addr)}
                 :client/http (ig/ref :client/http)}
   ;; Our connection to the Kubelt p2p system. Typically write paths
   ;; will go through a kubelt managed http gateway.
   ;; TODO inject common HTTP client.
   :client/p2p {:p2p/read {:http/scheme :http
                           :http/address (ig/ref :p2p/read-addr)}
                :p2p/write {:http/scheme :http
                            :http/address (ig/ref :p2p/write-addr)}}
   ;; A map from scope identifier to session token (JWT). Upon
   ;; successfully authenticating against a core, the returned session
   ;; token is kept here.
   :crypto/session {}
   ;; The current "wallet" implementation. This is provided externally
   ;; by the user.
   ;; TODO provide no-op wallet implementation, or try to detect wallet
   ;; in the environment, e.g. metamask in browser.
   :crypto/wallet {}})

(defn config [default-system-config sdk-config]
  ;; NB: inject supplied configuration into the system map before
  ;; calling ig/init. The updated values will be passed to the system
  ;; init fns.

  (let [;; Use any JWTs supplied as options.
        credentials       (get sdk-config :credential/jwt {})
        ;; Use the wallet provided by the user, or default to a no-op
        ;; wallet otherwise.
        wallet            (or (get sdk-config :crypto/wallet)
                              (lib.wallet/no-op))
        ;; Get p2p connection addresses determined by whether or not we
        ;; can detect a locally-running p2p node.
        p2p-options       (detect/node-or-gateway (:client/p2p default-system-config) sdk-config)
        ;; Get the address of the IPFS node we talk to.
        ipfs-read         (get sdk-config :ipfs/read)
        ipfs-read-scheme  (get sdk-config :ipfs.read/scheme)
        ipfs-write        (get sdk-config :ipfs/write)
        ipfs-write-scheme (get sdk-config :ipfs.write/scheme)
        ;; Get the r/w addresses of the Kubelt gateways we talk to.
        p2p-read          (get sdk-config :p2p/read)
        p2p-write         (get sdk-config :p2p/write)
        ;; Get the default minimum log level.
        log-level         (get sdk-config :log/level)
        ;; Update the system configuration map before initializing the
        ;; system.
        ]
    ;; NB: If we provide an additional collection of keys when calling
    ;; integrant.core/init, only those keys will be initialized.
    ;;
    ;; TODO use this mechanism to selectively initialize the system for
    ;; the current context, i.e. in browser, node cli client, etc.
    (-> default-system-config
        (assoc :log/level log-level)
        (assoc :ipfs/read-addr ipfs-read)
        (assoc :ipfs/read-scheme ipfs-read-scheme)
        (assoc :ipfs/write-addr ipfs-write)
        (assoc :ipfs/write-scheme ipfs-write-scheme)
        (assoc :p2p/read-addr p2p-read)
        (assoc :p2p/write-addr p2p-write)
        (assoc :crypto/session credentials)
        (assoc :crypto/wallet wallet)
        (assoc :client/p2p p2p-options))))


(defn hidrate-options
  "Return an options map that can be used to reinitialize the SDK."
  [sys-map]
  (let [ipfs-read (get sys-map :ipfs/read-addr)
        ipfs-read-scheme (get sys-map :ipfs/read-scheme)
        ipfs-write (get sys-map :ipfs/write-addr)
        ipfs-write-scheme (get sys-map :ipfs/write-scheme)
        p2p-read (get sys-map :p2p/read-addr)
        p2p-read-scheme (get-in sys-map [:client/p2p :p2p/read :http/scheme])
        p2p-write (get sys-map :p2p/write-addr)
        p2p-write-scheme (get-in sys-map [:client/p2p :p2p/write :http/scheme])
        log-level (get sys-map :log/level)
        ;; TODO rename :crypto/session to :crypto/vault for clarity
        credentials (lib.vault/tokens (:crypto/session sys-map))
        wallet (get sys-map :crypto/wallet)]
    {:log/level log-level
     :ipfs/read ipfs-read
     :ipfs.read/scheme ipfs-read-scheme
     :ipfs/write ipfs-write
     :ipfs.write/scheme ipfs-write-scheme
     :p2p/read p2p-read
     :p2p.read/scheme p2p-read-scheme
     :p2p/write p2p-write
     :p2p.write/scheme p2p-write-scheme
     :crypto/wallet wallet
     :credential/jwt credentials}))
