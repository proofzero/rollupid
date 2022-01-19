(ns com.kubelt.sdk.impl.multiaddr
  "Multiaddress utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["multiaddr" :refer [Multiaddr]]))

;; TODO general multiaddr construction from network address parts / map.

;; TODO test me
(defn str->map
  "Convert a Multiaddress string into a map of components."
  [s]
  {:pre [(string? s)]}
  (let [ma (Multiaddr. s)
        ;; Returns an object containing address components in the common
        ;; format expected by Node library functions.
        address (.nodeAddress ma)
        host (.-address address)
        port (.-port address)
        family (.-family address)
        protos (js->clj (.protos ma) :keywordize-keys true)]
    {:kubelt/type :kubelt.type/node-address
     :address/host host
     :address/port port
     :address/family family
     :address/protos protos}))
