(ns com.kubelt.lib.config.system
  "SDK system config."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.spec.config :as spec.config]
   [com.kubelt.lib.config.default :as lib.config.default])
  (:require-macros
   [com.kubelt.spec :as kubelt.spec]))

;; Public
;; -----------------------------------------------------------------------------

(defn config [system-config options]
  "Return an integrant system configuration map that combines a default
  configuration and a user-provided configuration options map."
  (->> [[:log/level :log/level]
        [:ipfs.read/multiaddr :ipfs.read/multiaddr]
        [:ipfs.read/scheme :ipfs.read/scheme]
        [:ipfs.write/multiaddr :ipfs.write/multiaddr]
        [:ipfs.write/scheme :ipfs.write/scheme]
        [:p2p/port :p2p/port]
        [:p2p/host :p2p/host]
        [:p2p/scheme :p2p/scheme]
        [:p2p/multiaddr :p2p/multiaddr]
        [:crypto/session :credential/jwt {}]
        [:crypto/wallet :crypto/wallet]]
       (reduce (fn [s [sys-kw opts-kw default]]
                 (if-let [data (get options opts-kw default)]
                   (assoc s sys-kw data)
                   s)) system-config)))

(defn config->system
  "Return a system configuration map including defaults where options were
  not supplied by the user. In any of the supplied values did not
  conform to the options schema, an error map is returned."
  [config-map]
  (kubelt.spec/conform
   spec.config/optional-sdk-config config-map
   (let [sdk-config (merge lib.config.default/sdk config-map)]
     ;; Check that the final options map (defaults combined with
     ;; user-provided options) is valid.
     (kubelt.spec/conform
      spec.config/sdk-config sdk-config
      (let [;; Construct a system configuration map from the default
            ;; configuration combined with the options provided by the
            ;; user.
            system-config (config lib.config.default/system sdk-config)]
        (kubelt.spec/conform
         spec.config/system-config system-config
         ;; Returns the system configuration map, or an error map.
         system-config))))))
