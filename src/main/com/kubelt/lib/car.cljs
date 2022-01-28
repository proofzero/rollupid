(ns com.kubelt.lib.car
  "Do stuff with Content ARchives."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.proto.bag-io :as bag-io]
   [com.kubelt.lib.car.file :as car.file]
   [com.kubelt.lib.bag.check :as bag.check]))

;; Public
;; -----------------------------------------------------------------------------

(defn write-bag!
  "Write a CAR from the given BAG using the supplied bag writer."
  [bag-writer bag]
  {:pre [(satisfies? bag-io/BagWriter bag-writer)
         (bag.check/bag? bag)]}
  (bag-io/write bag-writer bag))

(defn write-to-file!
  "Write a BAG to a CAR file."
  [bag file-name]
  {:pre [(string? file-name)]}
  (let [car-writer (car.file/->CarFile file-name)]
    (bag-io/write car-writer bag)))

(defn write-to-ipfs!
  "Write a BAG to IPFS, returning a CID."
  [sys bag]
  ;; TODO
  )
