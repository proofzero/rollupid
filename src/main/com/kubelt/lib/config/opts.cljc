(ns com.kubelt.lib.config.opts
  "Configuration-related support."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as str]
   [com.kubelt.lib.wallet :as lib.wallet]))

;; Default logging level.
(def log-level :warn)

;; Default configuration
;; -----------------------------------------------------------------------------

;; By default we look for a local IPFS node.
(def default-ipfs
  {:ipfs.read/multiaddr "/ip4/127.0.0.1/tcp/5001"
   :ipfs.read/scheme :http
   :ipfs.write/multiaddr "/ip4/127.0.0.1/tcp/5001"
   :ipfs.write/scheme :http})

(def default-p2p
  {:p2p/multiaddr "/ip4/127.0.0.1/tcp/8787"
   :p2p/scheme :http})

(def default-logging
  {:log/level log-level})

;; By default we have no JWTs available when initializing the SDK. When
;; JWTs are supplied, it should be as a map from core name to
;; corresponding JWT:
;; {"0xF4E9A36d4D37B1F83706c58eF8e3AF559F4c1E2E" "<header>.<payload>.<signature>"}
(def default-credentials
  {:crypto/wallet (lib.wallet/no-op)
   :credential/jwt {}})

(def sdk-defaults
  (merge default-ipfs
         default-p2p
         default-logging
         default-credentials))

;; Internal
;; -----------------------------------------------------------------------------

(defn log-level->keyword
  "Convert a log level string (e.g. 'info', ':info') to a keyword."
  [s]
  (if (string? s)
    (keyword (str/replace s #"^:" ""))
    log-level))

;; Public
;; -----------------------------------------------------------------------------

#?(:node
   (defn obj->map
     "Convert a JavaScript configuration object to a Clojure config map."
     [o]
     {:pre [(object? o)]}
     (let [config  (js->clj o :keywordize-keys true)]
       (if (empty? config)
         sdk-defaults
       ;; Fix up any config map values that didn't translate from
       ;; JavaScript.
         (-> config
             (update-in [:log/level] log-level->keyword))))))
