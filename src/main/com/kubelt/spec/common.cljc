(ns com.kubelt.spec.common
  "Specs for commonly used types of data."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Common
;; -----------------------------------------------------------------------------

(def byte-length
  :int)

(def bit-length
  :int)

;; A portable spec for byte data. Per environment we expect:
;; - [CLJ] a primitive byte array
;; - [CLJS] an Uint8Array instance
(def byte-data
  #?(:clj bytes?
     ;; TODO should be a Uint8Array
     :cljs :any))
