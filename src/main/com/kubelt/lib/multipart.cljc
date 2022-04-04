(ns com.kubelt.lib.multipart
  "Construct multipart form data HTTP request bodies."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.lib.octet :as lib.octet]
   [com.kubelt.lib.uuid :as lib.uuid]))

;; TODO move this into com.kubelt.lib; com.kubelt.lib.http?
;; TODO create part (from-file)
;; TODO support streams/readers
;; TODO com.kubelt.lib.media-type
;; - library for building / parsing media types

;; Definitions
;; -----------------------------------------------------------------------------

(def multipart-type
  "multipart/form-data")

;; Internal
;; -----------------------------------------------------------------------------

(defn- part->str
  [part]
  {:pre [(map? part)]}
  (let [part-name (get part :part/name)
        part-name (str "\"" part-name "\"")
        part-name (cstr/join "=" ["name" part-name])

        file-name (get part :part/file-name)
        file-name (when file-name
                    (let [quoted-name (str "\"" file-name "\"")]
                      (cstr/join "=" ["filename" quoted-name])))

        pairs (->> [part-name file-name]
                   (remove nil?)
                   (cstr/join "; "))
        disposition (cstr/join "; " ["form-data" pairs])
        disposition (cstr/join ": " ["Content-Disposition" disposition])

        media-type (get part :part/media-type)
        content-type (when media-type
                       (cstr/join ": " ["Content-Type" media-type]))

        part-data (get part :part/data)
        parts (remove nil? [disposition content-type "" part-data])]
    (cstr/join "\n" parts)))

(defn- make-boundary
  "Make a unique boundary string to use as a separator between the parts
  of the multipart form data."
  []
  (let [unique (lib.uuid/random)
        divider "--"]
    (cstr/join "" [divider unique])))

(defn- make-trailer
  "Return the string that should be used as the trailing part separator
  after all of the parts of the multipart form data. This is the same as
  the boundary with a two-hyphen suffix."
  [boundary]
  (str boundary "--"))

;; Public
;; -----------------------------------------------------------------------------

(defn multipart?
  [x]
  (and
   (map? x)
   (= :kubelt.type/multipart (get x :com.kubelt/type))))

(defn create
  "Create an empty multipart request body."
  ([]
   (let [boundary (make-boundary)]
     {:com.kubelt/type :kubelt.type/multipart
      :multipart/media-type multipart-type
      :multipart/boundary boundary
      :multipart/length 0
      :multipart/parts []}))
  ([options]
   {:pre [(map? options)]}
   (let [multi-part (create)
         options (select-keys options [:multipart/max-length])]
     (merge multi-part options))))

(defmulti append-part
  "Append a multipart entity to a multipart form data map."
  {:arglists '([multi-part part-map])}
  (fn [multi-part part]
    (let [part-data (get part :part/data)]
      ;; [clj] File
      ;; [clj] byte-array
      ;; [clj] InputStream
      (cond
        (string? part-data) :string))))

(defmethod append-part :string
  [multi-part part]
  {:pre [(map? multi-part) (map? part)]}
  (let [parts (get multi-part :multipart/parts [])
        part-name (get part :part/name)
        part-filename (get part :part/file-name)
        part-data (get part :part/data)
        part-length (if (contains? part :part/length)
                      (get part :part/length)
                      (lib.octet/size part-data))
        part-mediatype (get part :part/media-type "text/plain")
        part-map {:com.kubelt/type :kubelt.type/multipart.part
                  :part/name part-name
                  :part/data part-data
                  :part/length part-length
                  :part/media-type part-mediatype}
        part-map (if part-filename
                   (merge part-map {:part/file-name part-filename})
                   part-map)]
    (-> multi-part
        (update :multipart/length + part-length)
        (update :multipart/parts conj part-map))))

#_(defmethod append-part :file
  [multi-part part]
  {:pre [(map? multi-part) (map? part)]}
  (let [parts (get multi-part :multipart/parts [])
        part-name (get part :part/name)
        part-filename (get part :part/file-name)
        part-mediatype (get part :part/media-type)
        part-data (get part :part/data)
        part-length (lib.octet/size part-data)
        part {:com.kubelt/type :kubelt.type/multipart.part
              :part/name part-name
              :part/data part-data
              :part/length part-length
              :part/file-name part-filename
              :part/media-type part-mediatype}]
    (-> multi-part
        (update :multipart/length + part-length)
        (update :multipart/parts conj part))))

(defn headers
  "Returns HTTP request headers for the given multipart."
  [multi-part]
  {:pre [(map? multi-part)]}
  (let [{:keys [multipart/media-type multipart/boundary]} multi-part
        boundary-str (cstr/join "=" ["boundary" boundary])
        content-type (cstr/join "; " [media-type boundary-str])
        content-length (get multi-part :multipart/length)]
    {:content-type content-type
     :content-length content-length}))

(defn as-string
  [multi-part]
  (let [boundary (get multi-part :multipart/boundary)
        trailer (make-trailer boundary)
        parts (get multi-part :multipart/parts)
        part-strings (map part->str parts)
        body (cstr/join (str "\n" boundary "\n") part-strings)]
    (str body "\n" trailer)))
