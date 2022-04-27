(ns com.kubelt.lib.config.default
  "Default configuration values."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [integrant.core :as ig])
  (:require
   [com.kubelt.lib.vault :as lib.vault]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; Default logging level.
(def log-level :warn)

;; Default configuration
;; -----------------------------------------------------------------------------

(def log
  {:log/level log-level})

;; By default we look for a local IPFS node.
(def ipfs
  {:ipfs.read/multiaddr "/ip4/127.0.0.1/tcp/5001"
   :ipfs.read/scheme :http
   :ipfs.write/multiaddr "/ip4/127.0.0.1/tcp/5001"
   :ipfs.write/scheme :http})

(def p2p
  {:p2p/multiaddr "/ip4/127.0.0.1/tcp/8787"
   :p2p/scheme :http})

(def logging
  {:log/level log-level})

(def credentials
  {:credential/jwt {}})

(def wallet
  {:crypto/wallet (lib.wallet/no-op)})

;; Public
;; -----------------------------------------------------------------------------

;; These are the defaults for the option map passed to the SDK init function.
(def sdk
  (merge ipfs
         log
         p2p
         credentials
         logging
         wallet))

;; These defaults should be overridden from the SDK init options map.
(def system
  (merge sdk
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
          ;; A crypto "vault" that stores session credentials.
          :crypto/session {:jwt/tokens (ig/ref :credential/jwt)}
          ;; A wrapper around the platform wallet functionality.
          :crypto/wallet {}}))
