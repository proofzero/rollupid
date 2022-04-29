(ns com.kubelt.lib.config.util
  "Configuration-related support utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.lib.config.default :as lib.config.default]))

;; Internal
;; -----------------------------------------------------------------------------

(defn log-level->keyword
  "Convert a log level string (e.g. 'info', ':info') to a keyword."
  [log-level]
  (if (string? log-level)
    (keyword (cstr/replace log-level #"^:" ""))
    log-level))

;; Public
;; -----------------------------------------------------------------------------

#?(:cljs
   (defn obj->map
     "Convert a JavaScript configuration object to a Clojure config map."
     [o]
     {:pre [(object? o)]}
     (let [config  (js->clj o :keywordize-keys true)]
       (if (empty? config)
         lib.config.default/sdk
         ;; Fix up any config map values that didn't translate from
         ;; JavaScript.
         (-> config
             (update-in [:log/level] log-level->keyword))))))
