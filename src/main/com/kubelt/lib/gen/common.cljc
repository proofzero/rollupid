(ns com.kubelt.lib.gen.common
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require [malli.util :as mu]
            [malli.core :as m]))

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

(defn re-gen [re-schema gen]
  (mu/update-in
   re-schema [0]
   (fn [x]
     (mu/update-properties
      x merge gen))))

(defn re-length [schema]
  (-> (mu/get-in schema [1]) (m/properties) :max))

(defn hex [schema]
  (let [length (re-length schema)]
    (re-gen schema {:gen/fmap (gen-fmap-hex length)})))
