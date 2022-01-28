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
  [options]
  (let [{read-host :p2p/read} options
        {write-host :p2p/write} options]
    ;; TODO Use the user-provided settings by default (at this point we
    ;; know the options map is valid)

    ;; If we detect a local p2p node, use it for reads

    #_(if-not (local-node?)
        (if (not (every? str/blank? [read-host read-port write-host write-port]))
          {:p2p.read/host read-host
           :p2p.read/port read-port
           :p2p.write/host write-host
           :p2p.write/port write-port}))

    {:p2p/read read-host
     :p2p/write write-host}))
