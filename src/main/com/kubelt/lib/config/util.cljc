(ns com.kubelt.lib.config.util
  "Configuration-related support utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.lib.config.default :as lib.config.default]))

;; str->kw
;; -----------------------------------------------------------------------------

(defn str->kw
  "Convert a log level string (e.g. 'info', ':info') to a keyword."
  [log-level]
  (if (string? log-level)
    (keyword (-> log-level (cstr/trim) (cstr/replace #"^:" "")))
    log-level))
