(ns com.kubelt.lib.config.sdk
  "Work with options for SDK (re)initialization."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.vault :as lib.vault]))

;; Public
;; -----------------------------------------------------------------------------

(defn options
  "Given a system map, return an options map that can be used to
  reinitialize the SDK with the same configuration by passing it
  to (com.kubelt.sdk.v1/init)."
  [sys-map]
  (let [ipfs-read-scheme (get sys-map :ipfs.read/scheme)
        ipfs-read-host (get sys-map :ipfs.read/host)
        ipfs-read-port (get sys-map :ipfs.read/port)
        ipfs-write-scheme (get sys-map :ipfs.write/scheme)
        ipfs-write-host (get sys-map :ipfs.write/host)
        ipfs-write-port (get sys-map :ipfs.write/port)
        oort-scheme (get sys-map :oort/scheme)
        oort-host (get sys-map :oort/host)
        oort-port (get sys-map :oort/port)
        log-level (get sys-map :log/level)
        ;; TODO rename :crypto/session to :crypto/vault for clarity
        credentials (lib.vault/tokens (:crypto/session sys-map))
        wallet (get sys-map :crypto/wallet)
        storage (get sys-map :config/storage)]
    {:app/name (get sys-map :app/name)
     :log/level log-level
     :ipfs.read/scheme ipfs-read-scheme
     :ipfs.read/host ipfs-read-host
     :ipfs.read/port ipfs-read-port
     :ipfs.write/scheme ipfs-write-scheme
     :ipfs.write/host ipfs-write-host
     :ipfs.write/port ipfs-write-port
     :oort/scheme oort-scheme
     :oort/host oort-host
     :oort/port oort-port
     :crypto/wallet wallet
     :config/storage storage
     :credential/jwt credentials}))
