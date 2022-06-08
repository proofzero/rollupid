(ns com.kubelt.spec.common
  "Specs for commonly used types of data."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

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

(defn hex-pattern [length]
  (str "[\\da-fA-F]{" length "}"))

(defn hex [length]
  [:and
   [:re
    (re-pattern (hex-pattern length))]
   [:string {:max length :min length}]])
