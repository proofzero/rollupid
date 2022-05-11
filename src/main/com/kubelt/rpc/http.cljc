(ns com.kubelt.rpc.http
  "HTTP-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr]))

;; user-agent
;; -----------------------------------------------------------------------------

;; TODO allow optional comment to be passed in and append to UA
;; string. May be useful for indicating build variant, commit-ish, etc.
(defn user-agent
  "Return a user agent string for the RPC client."
  [major minor revision]
  (let [product "com.kubelt.rpc/client"
        version (cstr/join "." [major minor revision])]
    (cstr/join " " [product version])))
