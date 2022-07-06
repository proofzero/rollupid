(ns com.kubelt.cloudflare.wrangler
  "A wrapper around Cloudflare wrangler2."
  (:require
   [babashka.fs :as fs]
   [cheshire.core :as json])  )

;; file-content
;; -----------------------------------------------------------------------------

(defmulti file-content
  "Returns a map with a :value key whose value is the file content that
  should be stored as a KV entry. If :base64 is true, the value is
  expected to be base64-encoded (useful for e.g. images)."
  (fn [path]
    (let [;; Extract the file extension as a string.
          ext (second (fs/split-ext path))]
      (condp = ext
        "css" :text
        "edn" :text
        "html" :text
        "js" :text
        "json" :text
        "map" :text
        "svg" :text
        "txt" :text
        "xml" :text
        "ico" :binary
        "jpg" :binary
        "png" :binary
        "ttf" :binary
        :default))))

(defmethod file-content :text
  [path]
  (let [value (slurp path)]
    {:value value}))

(defmethod file-content :binary
  [path]
  (let [encoder (java.util.Base64/getEncoder)
        byte-data (with-open [out (java.io.ByteArrayOutputStream.)]
                    (clojure.java.io/copy (clojure.java.io/input-stream path) out)
                    (.toByteArray out))
        value (.encodeToString encoder byte-data)]
    {:value value
     :base64 true}))

(defmethod file-content :default
  [path]
  (let [message (str "unhandled file:" path)]
    (throw (ex-info message {:path path}))))

;; file-expires
;; -----------------------------------------------------------------------------

(defn- file-expires
  "Return a map that describes when a key value entry
  expires. The :expiration key, if set, must have a timestamp value that
  is the time at which the key/value pair should be
  expired. The :expiration_ttl is a count of seconds after which the
  value should be expired (minimum 60 seconds)."
  [path]
  ;; TODO define cache management policies
  ;;:expiration 0
  ;;:expiration_ttl 60
  {})

;; files
;; -----------------------------------------------------------------------------

(defn files
  "Generate a list of files, as edn, in the format expected by CloudFlare
  utilities, e.g. wrangler, when specifying a list of files to put,
  delete, etc. Returns a vector of maps."
  [root-path]
  (let [files (fs/glob root-path "**")]
    (into [] (keep (fn [f]
                     ;; Strip out directories.
                     (when (fs/regular-file? f)
                       (let [file-name (str f)
                             rel-path (str "/" (fs/relativize root-path f))
                             key {:key rel-path}
                             content (file-content file-name)
                             expires (file-expires file-name)]
                         (merge key content expires))))
                   files))))
