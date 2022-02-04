(ns com.kubelt.lib.http.content
  "Support for content negotiation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.edn :as edn]
   [clojure.set :as cs]
   [clojure.string :as str]))

;; TODO support Accept-CH header
;; TODO support Accept-CH-Lifetime header
;; TODO Accept-Post
;; TODO Accept-Patch

;; (defn create
;;   ""
;;   []
;;   )

;; (defn encode
;;   [media-type data]
;;   )

;; (defn decode
;;   [media-type data]
;;   )

;; (defn encoder
;;   "Return an encode "
;;   [media-type data]
;;   )

;; (defn decoder
;;   [media-type data]
;;   )

(def encodings
  #{"*"
    "br"
    "compress"
    "deflate"
    "gzip"
    "identity"})

(def languages
  #{"de"
    "en"})

;; A q-factor string is a comma-separated sequence of quality values of
;; the form:
;;   xxx;q=n.nnn
;; where:
;; - xxx is in some collection of string values (e.g. encodings)
;; - n.nnn is in the range 0 <= x <= 1
;; - n may have up to three decimal places of precision
;; - the default q value 1
;;
;; Note that for two entries with the same quality value more specific
;; values have priority:
;;   text/html;q=0.5 > text/*;q=0.5 > */*;q=0.5.
(defn- q-factor
  "Parse a q-factor string into an ordered set, where the entries are
  ordered by the q-value."
  [s]
  (letfn [;; The fewer wildcards in the value, the more specific it is,
          ;; and the earlier in the ordering it should come.
          (compare-specificity [x y]
            (let [xn (count (re-seq #"\*" x))
                  yn (count (re-seq #"\*" y))
                  c (compare xn yn)]
              (if (not= c 0) c 1)))
          ;; Compare two quality values, return a comparison value in
          ;; the same way as the compare fn works.
          (compare-quality [x y]
            (- (compare x y)))
          ;; Sort two pairs based first on the quality value, and when
          ;; quality is the same, by the specificity of the
          ;; values. Expects pairs of [name q-value], e.g. ["foo" 0.5].
          (sort-quality [[xv xq :as x] [yv yq :as y]]
            (if (= x y)
              0
              (let [c (compare-quality xq yq)]
                (if (not= c 0)
                  c
                  (compare-specificity xv yv)))))
          ;; Split a string on semicolons.
          (split-semicolon [s]
            (str/split s #"\s*;\s*"))
          ;; Replace the quality element of the pair with a string
          ;; containing a numeric representation of the quality. If no
          ;; quality is given, returns the default quality of "1.0".
          ;; e.g. ["gzip" "q=0.5"] => ["gzip" "0.5"]
          ;; e.g. ["gzip" ""] => ["gzip" "1.0"]
          (extract-quality [[k v]]
            (if v
              (let [v (str/replace v #"q=" "")]
                [k v])
              [k "1.0"]))
          ;; Convert the quality value string into a number.
          ;; e.g. ["gzip" "1.0"] => ["gzip" 1.0]
          (parse-quality [[k v]]
            [k (edn/read-string v)])]
    (->> (str/split s #"\s*,\s*")
         (map split-semicolon)
         (map extract-quality)
         (map parse-quality)
         (apply sorted-set-by sort-quality)
         (map first)
         (into []))))

;; As long as the "identity;q=0" or "*;q=0" directives do not explicitly
;; forbid the "identity" value that means no encoding, the server must
;; never return a 406 Not Acceptable.
(defn- accept-media
  [headers]
  {:pre [(map? headers)]}
  (-> headers
    (get "accept")
    q-factor))

;; TODO insert "identity" at lowest priority if not present.
(defn- accept-encoding
  [headers]
  {:pre [(map? headers)]}
  (as-> headers $
    (get $ "accept-encoding")
    (q-factor $)
    (filter encodings $)))

(defn- accept-language
  [headers]
  {:pre [(map? headers)]}
  (as-> headers $
    (get $ "accept-language")
    (q-factor $)
    (filter languages $)))

(defn- negotiate-media
  [supported requested]
  {:requested requested
   :supported supported}
  )

(defn- negotiate-encoding
  [supported requested]
  {:requested requested
   :supported supported}
  )

(defn- negotiate-language
  [supported requested]
  {:requested requested
   :supported supported}
  )

;; Public
;; -----------------------------------------------------------------------------

(defn negotiate
  "Given the request header map and a vector of supported media types,
  return the negotiated mime type or an error indicated that it was not
  possible to negotiate a mutually agreeable format."
  [supported headers]
  ;; TODO add predicates
  ;; TODO add malli spec
  {:pre [(map? headers) (map? headers)]}
  (letfn [(normalize [m k v]
            (let [s (-> k str str/lower-case)]
              (assoc m s v)))]
    (let [;; Normalize keys.
          headers (reduce-kv normalize {} headers)
          ;; Supported values.
          media-supported (get supported :media-types)
          encoding-supported (get supported :encodings)
          language-supported (get supported :languages)
          ;; Convert header q-factors to ordered sequences.
          media-requested (accept-media headers)
          encoding-requested (accept-encoding headers)
          language-requested (accept-language headers)
          ;; Get the negotiated values.
          media (negotiate-media media-supported media-requested)
          encoding (negotiate-encoding encoding-supported encoding-requested)
          language (negotiate-language language-supported language-requested)]
      {"content-type" "fixme"
       "vary" "fixme"
       ;; 300 Multiple Choices
       ;; 406 Not Acceptable (return supported variants)
       ;; 415 Unsupported Media Type
       "status" "fixme"}
      {:media media
       :encoding encoding
       :language language}
      )))

(comment
  ;; Accept; a comma-separate list of mime types (each combined with
  ;; quality factor) that agent is willing to process.
  (def accept-str "application/json;q=0.5, text/html, application/transit+json;q=0.8")
  ;; Accept-Encoding
  (def accept-enc-str "xxx;q=0.5, deflate, gzip;q=1.0, *;q=0.5")
  ;; Accept-Language
  (def accept-lang-str "de, en;q=0.5")
  ;; *Accept-CH
  ;; *Accept-CH-Lifetime
  ;; => Vary
  ;; => Content-Encoding
  (def headers
    {"Accept" accept-str
     "Accept-Encoding" accept-enc-str
     "Accept-Language" accept-lang-str})

  (def supported
    {:media-types ["application/transit+json" "text/html"]
     :languages ["en"]
     :encodings ["gzip"]})
  )
