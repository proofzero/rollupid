(ns com.kubelt.lib.detect
  "Node and gateway detection."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]))

;; Public
;; -----------------------------------------------------------------------------

(defn local-node?
  "Detect if a local node is present."
  []
  false)

(defn node-or-gateway
  "Given a user-supplied options map (passed to the SDK initialization
  function), return a configuration map that is updated based on whether
  or not we detected a local p2p node. If not, use the user-provided
  settings; if we detect a local node, we override the user settings to
  force usage of the local node."
  [default options]
  (let [config (cond-> default
                 ;; Override p2p read address using options value, if present.
                 (contains? options :p2p/read)
                 (assoc-in [:p2p/read :http/address] (get options :p2p/read))
                 ;; Override TLS setting for p2p reads, if provided.
                 (contains? options :p2p.read/scheme)
                 (assoc-in [:p2p/read :http/scheme] (get options :p2p.read/scheme))
                 ;; Override p2p write address using options value, if present.
                 (contains? options :p2p/write)
                 (assoc-in [:p2p/write :http/address] (get options :p2p/write))
                 ;; Override TLS setting for p2p writes, if provided.
                 (contains? options :p2p.write/scheme)
                 (assoc-in [:p2p/write :http/scheme] (get options :p2p.write/scheme)))]
    ;; TODO Use the user-provided settings by default (at this point we
    ;; know the options map is valid).
    ;; If we detect a local p2p node, use it for reads.
    config))
