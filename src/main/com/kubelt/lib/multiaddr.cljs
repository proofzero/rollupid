(ns com.kubelt.lib.multiaddr
  "Multiaddress utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str])
  (:require
   ["multiaddr" :refer [Multiaddr]]))

;; TODO move to com.kubelt.lib.multi.addr

;; TODO general multiaddr construction from network address parts / map.

(defn vec->str
  "Convert a vector of keywords and values into a multiaddress string. For
  example, the vector [:ip4 \"127.0.0.1\" :tcp 8080] is converted into
  the multiaddress string /ip4/127.0.0.1/tcp/8080."
  [v]
  {:pre [(vector? v)]}
  (letfn [(name-for [x]
            (if (number? x)
              ;; Numbers need to be converted to strings separately
              ;; as (name) doesn't work on them.
              (str x)
              ;; Returns strings unchanged and keywords as strings.
              (name x)))]
    (let [parts (cons "" (map name-for v))]
      (str/join "/" parts))))

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
