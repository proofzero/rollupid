(ns com.kubelt.cloudflare.wrangler.asset
  "Generate asset manifests."
  (:require
   [clojure.string :as cstr]))

;; manifest
;; -----------------------------------------------------------------------------

(defn manifest
  "Return an asset manifest collection as edn. This is the mapping used by
  the CloudFlare worker to map requested files into keys in a KV store
  whose values contain the file contents."
  [files]
  {:pre [(coll? files)]}
  (let [leading-slash (re-pattern "^/")]
    (reduce (fn [a {path :key}]
              (let [k (cstr/replace path leading-slash "")
                    v path]
                (assoc a k v)))
            {} files)))
