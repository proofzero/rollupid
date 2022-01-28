(ns com.kubelt.lib.config
  "Configuration-related support."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [clojure.string :as str]))

;; Default configuration
;; -----------------------------------------------------------------------------

(def log-level :info)

(def default-p2p
  {:p2p/read "/ip4/127.0.0.1/tcp/9061"
   :p2p/write "/ip4/127.0.0.1/tcp/9061"})

(def default-logging
  {:logging/min-level log-level})

(def default-config
  (merge default-p2p
         default-logging))

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
