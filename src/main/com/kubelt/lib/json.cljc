(ns com.kubelt.lib.json
  "JSON utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [camel-snake-kebab.core :as csk])
  (:require
   [clojure.walk :as walk])
  #?(:clj
     (:require
      [jsonista.core :as json])
     :cljs
     (:require
      [cognitect.transit :as transit])))

;; TODO test me

;; Internal
;; -----------------------------------------------------------------------------

;; Replaces default json/keyword-keys-object-mapper.
#?(:clj
   (def keyword-mapper
     (json/object-mapper
      {:encode-key-fn csk/->camelCaseString
       :decode-key-fn csk/->kebab-case-keyword}))
   :cljs
   (def keyword-mapper
     {:encode-key-fn csk/->camelCaseString
      :decode-key-fn csk/->kebab-case-keyword}))

(defn- transform-keys
  "Recursively transform string map keys using the given transform fn."
  [m transform-fn]
  (let [f (fn [[k v]]
            (if (string? k)
              [(transform-fn k) v]
              [k v]))]
    (walk/postwalk (fn [x]
                     (if (map? x)
                       (into {} (map f x))
                       x)) m)))

;; Public
;; -----------------------------------------------------------------------------

(defn edn->json-str
  "Write edn data as a JSON string."
  [x]
  #?(:clj (json/write-value-as-string x)
     :cljs (js/JSON.stringify (clj->js x))))

(defn json-str->edn
  "Parse a JSON string into edn data."
  ([s]
   #?(:clj
      (json/read-value s)
      :cljs
      (let [r (transit/reader :json)]
        (transit/read r s))))
  ([s mapper]
   #?(:clj
      (json/read-value s keyword-mapper)
      :cljs
      (let [r (transit/reader :json)
            decode-fn (get mapper :decode-key-fn)
            data-edn (transit/read r s)]
        (transform-keys data-edn decode-fn)))))

(defn from-json
  "Parse a JSON string into edn data. If the keywordize? flag is set,
  process string keys into keywords in the result."
  [body keywordize?]
  (if keywordize?
    (json-str->edn body keyword-mapper)
    (json-str->edn body)))
