(ns com.kubelt.lib.config.system
  "SDK system config."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; Public
;; -----------------------------------------------------------------------------

(defn config [system-config options]
  "Return an integrant system configuration map that combines a default
  configuration and a user-provided configuration options map."
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
        log-level (get options :log/level)]
    ;; Update the system configuration map before initializing the
    ;; system.
    ;;
    ;; NB: If we provide an additional collection of keys when calling
    ;; integrant.core/init, only those keys will be initialized.
    (-> system-config
        (assoc :log/level log-level)
        (assoc :ipfs.read/multiaddr ipfs-read-maddr)
        (assoc :ipfs.read/scheme ipfs-read-scheme)
        (assoc :ipfs.write/multiaddr ipfs-write-maddr)
        (assoc :ipfs.write/scheme ipfs-write-scheme)
        (assoc :p2p/scheme p2p-scheme)
        (assoc :p2p/multiaddr p2p-multiaddr)
        (assoc :crypto/session credentials)
        (assoc :crypto/wallet wallet))))
