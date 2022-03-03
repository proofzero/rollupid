(ns com.kubelt.car.file
  "Support for working with CAR-format files."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  #_(:require
   ["@ipld/car" :as ipld.car :refer [CarReader CarWriter]]
   ["fs" :as fs]
   ["stream" :as stream :refer [Readable]])
  (:require
   [cljs.core.async :as async :refer [chan go <! >!]]
   [cljs.core.async.interop :refer-macros [<p!]])
  (:require
   [com.kubelt.car.build :as car.build]
   [com.kubelt.lib.bag.check :as bag.check]
   [com.kubelt.lib.promise :as promise]
   [com.kubelt.proto.bag-io :as bag-io]))

;; Internal
;; -----------------------------------------------------------------------------

;; TODO test me
;; (defn- make-writer
;;   "Return a CarWriter 'channel'. A channel is a { writer:CarWriter,
;;   out:AsyncIterable<Uint8Array> } pair. The writer side can be used to
;;   put() blocks, while the out side of the channel emits the bytes that
;;   form the encoded CAR archive.

;;   NB: in Node.js you can use the Readable.from() API to convert the out
;;   AsyncIterable to a standard Node.js stream, or it can be directly fed
;;   to a stream.pipeline()."
;;   [roots]
;;   {:pre [(sequential? roots)]}
;;   (let [roots (clj->js roots)
;;         car-writer (.create CarWriter roots)]
;;     ;; Convert to map to allow destructuring in the caller.
;;     (js->clj car-writer :keywordize-keys true)))

;; ;; TODO figure out how we're writing CAR in-browser.
;; ;; TODO test me
;; (defn- make-file-writer
;;   [roots file-name]
;;   {:pre [(sequential? roots)
;;          (string? file-name)]}
;;   (let [{:keys [writer out]} (make-writer roots)
;;         ;; NB: Node.js *only*.
;;         write-stream (.createWriteStream fs file-name)]
;;     ;; Pipe the out side of channel to a write stream.
;;     (.pipe (.from Readable out) write-stream)
;;     writer))

;; ;; TODO test me
;; (defn write-car!
;;   "Write a CAR map to the given output file."
;;   [{:keys [kubelt.car/blocks :kubelt.car/roots] :as car} file-name]
;;   (go
;;     (let [writer (make-file-writer roots file-name)]
;;       (doseq [block blocks]
;;         (<p! (.put writer block)))
;;       (<p! (.close writer)))))

;; CarFile
;; -----------------------------------------------------------------------------
;; Used to write a BAG to a CAR file. Implements the BagWriter protocol.
;;
;; E.g.
;; (def car-file (->CarFile "/my/output.car"))
;; (def bag (-> (bag/make-bag) (add-dag ...))
;; (write car-file bag)

(defrecord CarFile [^String file-name]
  bag-io/BagWriter
  (write-bag [this bag]
    {:pre [(bag.check/bag? bag)]}
    (-> (car.build/car bag)
        (promise/then
         (fn [car]
           ;; TODO do something nice and cross platform here
           ;;(write-car! car file-name)
           )))))
