(ns com.kubelt.lib.http.media-type
  "Media types"
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as cstr]))

;; Media Types
;; -----------------------------------------------------------------------------

(def json
  "application/json")

(def text
  "text/plain")

(def transit+json
  "application/transit+json")

(def transit+msgpack
  "application/transit+msgpack")

(def ld+json
  "application/ld+json")

(def application
  #{json
    text
    transit+json
    transit+msgpack
    ld+json})

;; Suffixes
;; -----------------------------------------------------------------------------

(def suffixes
  #{"ber"
    "cbor"
    "cbor-seq"
    "der"
    "fastinfoset"
    "gzip"
    "json"
    "json-seq"
    "wbxml"
    "xml"
    "zip"})

;; Utilities
;; -----------------------------------------------------------------------------
;; TODO spec for media-type

(defn text?
  [headers]
  {:pre [(map? headers)]}
  (let [content-type (get headers "content-type" "")]
    (cstr/starts-with? content-type text)))

(defn json?
  [headers]
  {:pre [(map? headers)]}
  (let [content-type (get headers "content-type" "")]
    ;; TODO flesh this out to support other JSON media types.
    (cstr/starts-with? content-type json)))

(def groups
  [:media/type :media/subtype :media/suffix])

(def pattern
  #"^(?<type>\w+)/(?<subtype>[\.\w]+)(?<suffix>\+\w+)?$")

(defn decode
  "Decode a media type string into a map of its components."
  [s]
  {:pre [(string? s)]}
  (let [clean-string (-> s cstr/trim cstr/lower-case)
        [lower-string & params] (cstr/split clean-string #";")]
    ;; Note that we return nil when string doesn't match media-type
    ;; regex pattern.
    (when-some [matches (re-matches pattern lower-string)]
      ;; The string matched the media-type regex pattern. Extract the
      ;; parts and turn them into a map.
      (letfn [(extract-prefix [s]
                (if (cstr/includes? s ".")
                  (first (cstr/split s #"\."))
                  ""))
              (extract-suffix [s]
                (if s
                  (if (cstr/includes? s "+")
                    (cstr/replace s "+" "")
                    "")
                  ""))
              (clean-param [s]
                (-> s
                    (cstr/replace ";" "")
                    (cstr/trim)
                    (cstr/split #"\s*=\s*")))
              (extract-params [params]
                (if (seq params)
                  (into {} (map clean-param params))
                  {}))]
        (let [;; Drop the full matched string. The remaining elements
              ;; correspond to the capturing groups.
              parts (drop 1 matches)
              base-map (zipmap groups parts)
              params-map (extract-params params)
              subtype-str (get base-map :media/subtype)
              prefix (extract-prefix subtype-str)
              suffix-str (get base-map :media/suffix)
              suffix (extract-suffix suffix-str)]
          (-> base-map
              (assoc :media/prefix prefix)
              (assoc :media/suffix suffix)
              (assoc :media/params params-map)
              (assoc :com.kubelt/type :kubelt.type/media-type)))))))

(defn encode
  "Encode a media type map into its string representation."
  [m]
  (letfn [(build-params [params]
            (let [parts (map (fn [[k v]] (str k "=" v)) params)]
              (str ";" (cstr/join ";" parts))))]
    (let [t (get m :media/type)
          st (get m :media/subtype)
          suffix (if-some [s (get m :media/suffix)]
                   (str "+" s)
                   "")
          params (-> m (get :media/params) build-params)]
      (-> (cstr/join "/" [t st])
          (str suffix params)))))

(defn media-type?
  [x]
  (and
   (map? x)
   (= :kubelt.type/media-type (:com.kubelt/type x))))

(defn- tree-check
  [x prefix]
  (cond
    (string? x)
    (if-some [parsed (decode x)]
      (= prefix (get parsed :media/prefix))
      false)
    (map? x)
    (= prefix (get x :media/prefix))
    :else false))

;; type "/" subtype ["+" suffix] *[";" parameter]
(defn standard-tree?
  [x]
  (tree-check x ""))

;; type "/" "vnd." subtype ["+" suffix] *[";" parameter]
(defn vendor-tree?
  [x]
  (tree-check x "vnd"))

;; type "/" "prs." subtype ["+" suffix] *[";" parameter]
(defn personal-tree?
  [x]
  (tree-check x "prs"))

;; type "/" "x." subtype ["+" suffix] *[";" parameter]
(defn unregistered-tree?
  [x]
  (tree-check x "x"))
