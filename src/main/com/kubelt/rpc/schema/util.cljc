(ns com.kubelt.rpc.schema.util
  "OpenRPC schema utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [camel-snake-kebab.core :as csk]))

;; s->kw
;; -----------------------------------------------------------------------------

(defn s->kw
  "Convert a string to a keyword, transforming it into idiomatic kebab
  case."
  [s]
  (-> s keyword csk/->kebab-case))

;; name->path
;; -----------------------------------------------------------------------------
;; TODO allow to override the separator; should be passed as a
;; configuration value in the (init) options map.
;; TODO make private

(defn name->path
  "Given a string resource name, return a 'path' data value (a vector of
  keywords). Currently assumes that names use '_' as a separator between
  path components."
  [s]
  {:pre [(string? s)]}
  (let [parts (cstr/split s #"_")]
    (mapv s->kw parts)))
