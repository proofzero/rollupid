(ns com.kubelt.lib.json
  "JSON utilities."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [camel-snake-kebab.core :as csk])
  #?(:clj
     (:require
      [jsonista.core :as json])))

;; TODO support node / browser.
;; TODO test me

;; Internal
;; -----------------------------------------------------------------------------

;; Replaces default json/keyword-keys-object-mapper.
(def keyword-mapper
  (json/object-mapper
   {:encode-key-fn csk/->camelCaseString
    :decode-key-fn csk/->kebab-case-keyword}))

;; Public
;; -----------------------------------------------------------------------------

(defn edn->json-str
  "Write edn data as a JSON string."
  [x]
  #?(:clj (json/write-value-as-string x)))

(defn json-str->edn
  "Parse a JSON string into edn data."
  ([s]
   #?(:clj (json/read-value s)))
  ([s mapper]
   #?(:clj (json/read-value s keyword-mapper))))

(defn from-json
  "Parse a JSON string into edn data. If the keywordize? flag is set,
  process string keys into keywords in the result."
  [body keywordize?]
  (if keywordize?
    (json-str->edn body keyword-mapper)
    (json-str->edn body)))
