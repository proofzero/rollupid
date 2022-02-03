(ns com.kubelt.lib.http.content
  "Support for content negotiation."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.edn :as edn]
   [clojure.string :as str]))

(defn create
  ""
  []
  )

(defn encode
  [media-type data]
  )

(defn decode
  [media-type data]

  )

(defn encoder
  "Return an encode "
  [media-type data]
  )

(defn decoder
  [media-type data]
  )

(def encodings
  #{"*"
    "br"
    "compress"
    "deflate"
    "gzip"
    "identity"})

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
(defn q-factor
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
    ;; TODO use transducer.
    (->> (str/split s #"\s*,\s*")
         (map split-semicolon)
         (map extract-quality)
         (map parse-quality)
         (apply sorted-set-by sort-quality)
         (map first))))

;; As long as the "identity;q=0" or "*;q=0" directives do not explicitly
;; forbid the "identity" value that means no encoding, the server must
;; never return a 406 Not Acceptable.
(defn accept-encoding
  [s]
  ;; TODO filter out encodings not in encodings set
  (q-factor s)
  )

(defn negotiate
  "Given the request header map and a vector of supported media types,
  return the negotiated mime type or an error indicated that it was not
  possible to negotiate a mutually agreeable format."
  [headers supported]
  {:pre [(map? headers) (vector? supported) (every? string? supported)]}
  (letfn [(normalize [m k v]
            (let [s (-> k str str/lower-case)]
              (assoc m s v)))]
    (let [;; Normalize keys.
          headers (reduce-kv normalize {} headers)
          accept (get headers "accept")
          encoding (get headers "accept-encoding")
          language (get headers "accept-language")]
      headers
      )))

(comment
  ;; Accept; a comma-separate list of mime types (each combined with
  ;; quality factor) that agent is willing to process.
  (def accept-text "text/*")
  ;; Accept-Encoding
  (def accept-gzip "gzip; q=0.1")
  ;; Accept-Language
  (def accept-english "en")
  ;; *Accept-CH
  ;; *Accept-CH-Lifetime
  ;; => Vary
  ;; => Content-Encoding
  (def headers
    {"Accept" accept-text
     "Accept-Encoding" accept-encoding
     "Accept-Language" accept-english})
  )
