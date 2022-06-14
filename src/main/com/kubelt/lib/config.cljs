(ns com.kubelt.lib.config
  "Configuration-related support."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.config.default :as lib.config.default]
   [com.kubelt.lib.config.util :as lib.config.util]))

;; obj->map
;; -----------------------------------------------------------------------------

(defn obj->map
  "Convert a JavaScript object containing SDK initialization options to a
  Clojure config map containing the same configuration options but
  updated to conform to the schema that defines what is allowed as an
  option to the SDK (init) call. Any configuration options that aren't
  provided are set to their default values in the returned map."
  [o]
  {:pre [(object? o)]}
  (let [config  (js->clj o :keywordize-keys true)
        config  (merge lib.config.default/sdk config)]
    ;; Fix up any config map values that didn't translate from
    ;; JavaScript.
    (-> config
        (update-in [:log/level] lib.config.util/str->kw)
        (update-in [:oort/scheme] lib.config.util/str->kw)
        (update-in [:ipfs.read/scheme] lib.config.util/str->kw)
        (update-in [:ipfs.write/scheme] lib.config.util/str->kw))))
