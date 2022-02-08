(ns com.kubelt.lib.bin
  "Binary data-related utilities."
  (:require
   #?(:clj [clojure.java.io :as io])))

(defn slurp-bytes
  [x]
  #?(:clj
     (with-open [out-stream (java.io.ByteArrayOutputStream.)]
       (let [in-stream (clojure.java.io/input-stream x)]
         (clojure.java.io/copy in-stream out-stream)
         (.toByteArray out-stream)))))
