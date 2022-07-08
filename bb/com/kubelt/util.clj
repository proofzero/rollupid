(ns com.kubelt.util
  "Misc utilities."
  (:require
   [babashka.process :as proc]
   [clojure.string :as cstr]))

;; which
;; -----------------------------------------------------------------------------

(defn which
  "Return the path to the given executable on the path, if present."
  [bin-name]
  (-> (proc/process ["which" bin-name]) proc/check :out slurp cstr/trim))
