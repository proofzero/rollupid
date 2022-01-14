(ns com.kubelt.sdk.impl.io.bag
  "Implementations of the BagReader and BagWriter protocols."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.proto.bag-io :as bag-io]))

;; CAR File
;; -----------------------------------------------------------------------------

(defrecord CarFile [file-name]
  BagWriter
  (write [this bag]
    (println "writing BAG to " file-name)
    ))

;; IPFS (HTTP)
;; -----------------------------------------------------------------------------
;; Read and write a BAG to IPFS using ipfs-http-client.

(defrecord DagAPI [sys]
  BagReader
  (read [this cid]
    (println "reading BAG from IPFS DAG API")
    )

  BagWriter
  (write [this bag]
    (println "writing BAG to IPFS DAG API")
    ))

;; IPFS (message port)
;; -----------------------------------------------------------------------------
;; Read and write a BAG to IPFS using ipfs-message-port-client.

;; TODO?
