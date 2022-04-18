(ns com.kubelt.lib.re
  "Regular expression utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})

;; regexp?
;; -----------------------------------------------------------------------------

(defn regexp?
  "Returns true if the given value is a regular expression, false
  otherwise."
  [x]
  #?(:clj (instance? java.util.regex.Pattern x)
     :cljs (cljs.core/regexp? x)))
