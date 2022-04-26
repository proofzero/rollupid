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
