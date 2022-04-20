(ns com.kubelt.lib.http.media-type
  "Media types."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]))

;; TODO promote this to com.kubelt.lib.media-type

;; Media Types
;; -----------------------------------------------------------------------------

(def transit-json
  "application/transit+json")

(def transit-msgpack
  "application/transit+msgpack")

(def text-plain
  "text/plain")

;; Public
;; -----------------------------------------------------------------------------

(defn text?
  [headers]
  {:pre [(map? headers)]}
  (let [content-type (get headers "content-type" "")]
    (cstr/starts-with? content-type "text/plain")))

(defn json?
  [headers]
  {:pre [(map? headers)]}
  (let [content-type (get headers "content-type" "")]
    ;; TODO flesh this out to support other Json media types.
    (cstr/starts-with? content-type "application/json")))
