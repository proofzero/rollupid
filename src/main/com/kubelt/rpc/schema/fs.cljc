(ns com.kubelt.rpc.schema.fs
  "Filesystem utilities for OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [malli.core :as mc]
   [malli.transform :as mt])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.rpc.schema.util :as rpc.schema.util]
   [com.kubelt.spec.rpc.schema :as spec.rpc.schema])
  #?(:node
     (:require
      ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
      [com.kubelt.lib.promise :as lib.promise])))

;; A decoding transformer, only mounting to :string schemas with
;; truthy :string/trim property, e.g.
;; [:string {:string/trim true :min 1}]
(defn string-trimmer
  []
  (mt/transformer
   {:decoders
    {:string
     {:compile (fn [schema _]
                 (let [{:string/keys [trim]} (mc/properties schema)]
                   (when trim #(cond-> % (string? %) cstr/trim))))}}}))

(def key-decoder
  (mt/key-transformer {:decode rpc.schema.util/s->kw}))

(defn conform
  "Given a parsed schema as an edn value, clean it up and validate against
  our schema. If any errors are detected, an error map is returned,
  otherwise the transformed schema is returned."
  [edn]
  (let [tf (mt/transformer #_mt/strip-extra-keys-transformer
                           mt/string-transformer
                           mt/json-transformer
                           string-trimmer
                           key-decoder)
        clean-edn (mc/decode spec.rpc.schema/schema edn tf)]
    (if-not (mc/validate spec.rpc.schema/schema clean-edn)
      (lib.error/explain spec.rpc.schema/schema clean-edn)
      clean-edn)))

;; read-schema
;; -----------------------------------------------------------------------------

(defn read-schema
  "Load an OpenRPC schema from a file. Validates the OpenRPC schema and
  returns an error map if any issues were detected. Otherwise, returns
  the schema as a map whose keys have been keywordized and converted to
  kebab case."
  [filename]
  #?(:browser nil
     :node (lib.promise/promise
            (fn [resolve reject]
              (-> (.readFile fs-promises filename)
                  (lib.promise/then #(resolve (conform (lib.json/json-str->edn % lib.json/keyword-mapper))))
                  (lib.promise/catch reject))))
     :clj
     (let [json-str (slurp filename)
           keywordize? true]
       (conform (lib.json/from-json json-str keywordize?)))))
