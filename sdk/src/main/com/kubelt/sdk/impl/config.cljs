(ns com.kubelt.sdk.impl.config
  "Configuration-related support."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]))

;; Default configuration
;; -----------------------------------------------------------------------------

(def log-level :info)

(def default-config
  {:logging/min-level log-level})

;; Internal
;; -----------------------------------------------------------------------------

(defn log-level->keyword
  "Convert a log level string (e.g. 'info', ':info') to a keyword."
  [s]
  (if (string? s)
    (keyword (str/replace s #"^:" ""))
    log-level))

;; Public
;; -----------------------------------------------------------------------------

(defn obj->map
  "Convert a JavaScript configuration object to a Clojure config map."
  [o]
  {:pre [(object? o)]}
  (let [config (js->clj o :keywordize-keys true)]
    (if (empty? config)
      default-config
      ;; Fix up any config map values that didn't translate from
      ;; JavaScript.
      (-> config
          (update-in [:logging/min-level] log-level->keyword)))))
