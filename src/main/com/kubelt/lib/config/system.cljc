(ns com.kubelt.lib.config.system
  "SDK system config."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

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
        [:p2p/scheme :p2p/scheme]
        [:p2p/multiaddr :p2p/multiaddr]
        [:crypto/session :credential/jwt {}]
        [:crypto/wallet :crypto/wallet]]
       (reduce (fn [s [sys-kw opts-kw default]]
                 (if-let [data (get options opts-kw default)]
                   (assoc s sys-kw data)
                   s)) system-config)))
