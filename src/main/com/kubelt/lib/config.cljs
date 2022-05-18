(ns com.kubelt.lib.config
  "Configuration-related support."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as str]))

;; Internal
;; -----------------------------------------------------------------------------

(defn- log-level->keyword
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
          (update-in [:log/level] log-level->keyword)))))
