(ns com.kubelt.lib.config.system
  "SDK system config"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig]
   [com.kubelt.lib.config.opts :as config.opts]
   [com.kubelt.lib.vault :as lib.vault]))

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

;; These defaults should be overridden from the SDK init
;; options map.
;; The current "wallet" implementation. This is provided externally
;; by the user.
;; TODO provide no-op wallet implementation, or try to detect wallet
;; in the environment, e.g. metamask in browser.
(def default
  (merge
   config.opts/default-ipfs
   config.opts/default-p2p
   config.opts/default-wallet
   config.opts/default-logging
   {;; Our common HTTP client.
    :client/http {}
    ;; Our connection to IPFS.
    :client/ipfs {:ipfs/read {:http/scheme (ig/ref :ipfs.read/scheme)
                              :ipfs/multiaddr (ig/ref :ipfs.read/multiaddr)}
                  :ipfs/write {:http/scheme (ig/ref :ipfs.write/scheme)
                               :ipfs/multiaddr (ig/ref :ipfs.write/multiaddr)}
                  :client/http (ig/ref :client/http)}
    ;; Our connection to the Kubelt p2p system.
    :client/p2p {:http/scheme (ig/ref :p2p/scheme)
                 :p2p/multiaddr (ig/ref :p2p/multiaddr)}
    ;; A map from scope identifier to session token (JWT). Upon
    ;; successfully authenticating against a core, the returned session
    ;; token is kept here.
    :crypto/session {}}))

(defn config [default-system-config options]
  ;; NB: inject supplied configuration into the system map before
  ;; calling ig/init. The updated values will be passed to the system
  ;; init fns.
  (let [;; Use any JWTs supplied as options.
        credentials (get options :credential/jwt {})
        ;; Use the wallet provided by the user, or default to a no-op
        ;; wallet otherwise.
        wallet (get options :crypto/wallet)

        ;; Get the address of the IPFS node we talk to.
        ipfs-read-maddr (get options :ipfs.read/multiaddr)
        ipfs-read-scheme (get options :ipfs.read/scheme)
        ipfs-write-maddr (get options :ipfs.write/multiaddr)
        ipfs-write-scheme (get options :ipfs.write/scheme)
        ;; Get the address of the Kubelt gateway we talk to.
        p2p-scheme (get options :p2p/scheme)
        p2p-multiaddr (get options :p2p/multiaddr)
        ;; Get the default minimum log level.
        log-level (get options :log/level)
        ;; Update the system configuration map before initializing the
        ;; system.
        ]
    ;; NB: If we provide an additional collection of keys when calling
    ;; integrant.core/init, only those keys will be initialized.
    ;;
    ;; TODO use this mechanism to selectively initialize the system for
    ;; the current context, i.e. in browser, node cli client, etc.
    (-> default-system-config
        (assoc :log/level {:min/level log-level})
        (assoc :ipfs.read/multiaddr ipfs-read-maddr)
        (assoc :ipfs.read/scheme ipfs-read-scheme)
        (assoc :ipfs.write/multiaddr ipfs-write-maddr)
        (assoc :ipfs.write/scheme ipfs-write-scheme)
        (assoc :p2p/scheme p2p-scheme)
        (assoc :p2p/multiaddr p2p-multiaddr)
        (assoc :crypto/session credentials)
        (assoc :crypto/wallet wallet))))


(defn sdk-init-options
  "Return an options map that can be used to reinitialize the SDK."
  [sys-map]
  (let [ipfs-read-maddr (get sys-map :ipfs.read/multiaddr)
        ipfs-read-scheme (get sys-map :ipfs.read/scheme)
        ipfs-write-maddr (get sys-map :ipfs.write/multiaddr)
        ipfs-write-scheme (get sys-map :ipfs.write/scheme)
        p2p-multiaddr (get sys-map :p2p/multiaddr)
        p2p-scheme (get sys-map :p2p/scheme)
        log-level (get sys-map :log/level)
        ;; TODO rename :crypto/session to :crypto/vault for clarity
        credentials (lib.vault/tokens (:crypto/session sys-map))
        wallet (get sys-map :crypto/wallet)]
    {:log/level log-level
     :ipfs.read/multiaddr ipfs-read-maddr
     :ipfs.read/scheme ipfs-read-scheme
     :ipfs.write/multiaddr ipfs-write-maddr
     :ipfs.write/scheme ipfs-write-scheme
     :p2p/scheme p2p-scheme
     :p2p/multiaddr p2p-multiaddr
     :crypto/wallet wallet
     :credential/jwt credentials}))
