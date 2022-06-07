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

(def hex-digit
  (set "0123456789abcdefABCDEF"))

(defn rand-hex []
  (rand-nth (vec hex-digit)))

(defn generate-hex [length]
  (apply str (repeatedly length rand-hex)))

(defn gen-fmap-hex
  "malli helper to define :re schema using gen/fmap
   Pay attention that [:string {:min xx :max xx} goes after [:re …....] spec]
   otherwise malli will raise following error:
  \"Couldn't satisfy such-that predicate after 100 tries.\"

  Example:
      [:and
        [:re
          #?(:cljs {:gen/fmap (gen-fmap-hex 10)})
         (re-pattern (hex-pattern 10))]
        [:string {:min 10 :max 10}]]"
  [length]
  #(generate-hex length))

(defn hex-pattern [length]
  (str "[\\da-fA-F]{" length "}"))

(defn hex [length]
  [:and
   [:re
    #?(:cljs {:gen/fmap (gen-fmap-hex length)})
    (re-pattern (hex-pattern length))]
   [:string {:max length :min length}]])
