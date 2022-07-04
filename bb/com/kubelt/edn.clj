(ns com.kubelt.edn
  "Utilities for working with edn data."
  (:require
   [clojure.edn :as edn]
   [clojure.java.io :as io]
   [clojure.pprint :as pprint]))

;; read
;; -----------------------------------------------------------------------------

(defn read
  "Return the parsed content of the specified edn file or io/resource."
  [source]
  (with-open [reader (io/reader source)]
    (edn/read (java.io.PushbackReader. reader))))

;; write
;; -----------------------------------------------------------------------------

(defn write
  "Write some data to an edn file."
  [data sink]
  (with-open [writer (io/writer sink)]
    (pprint/pprint data writer)))
