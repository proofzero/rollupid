(ns com.kubelt.rpc.schema.fs
  "Filesystem utilities for OpenRPC schemas."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [malli.core :as mc]
   [malli.transform :as mt])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.json :as lib.json]
   [com.kubelt.spec.rpc.schema :as spec.rpc.schema]))

;; load
;; -----------------------------------------------------------------------------

#?(:clj
   (defn read-schema
     "Load an OpenRPC schema from a file. Validates the OpenRPC schema and
     returns an error map if any issues were detected. Otherwise, returns
     the schema as a map whose keys have been keywordized and converted to
     kebab case."
     [filename]
     (let [json-str (slurp filename)
           keywordize? true
           edn (lib.json/from-json json-str keywordize?)
           tf (mt/transformer mt/strip-extra-keys-transformer
                              mt/string-transformer
                              mt/json-transformer)
           clean-edn (mc/decode spec.rpc.schema/schema edn tf)]
       (if-not (mc/validate spec.rpc.schema/schema clean-edn)
         (lib.error/explain spec.rpc.schema/schema clean-edn)
         clean-edn))))
