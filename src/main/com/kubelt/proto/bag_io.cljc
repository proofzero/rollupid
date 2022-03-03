(ns com.kubelt.proto.bag-io
  "A protocol for reading and writing BAGs."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})


(defprotocol BagReader
  "Read BAGs (Bundle of Acyclic Graph)."
  (read-bag [this cid] "Read a BAG"))

(defprotocol BagWriter
  "Write a BAG."
  (write-bag [this bag] "Write a BAG"))
