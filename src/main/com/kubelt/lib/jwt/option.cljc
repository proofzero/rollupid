(ns com.kubelt.lib.jwt.option
  "Option related errors and utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; invalid
;; -----------------------------------------------------------------------------

(defn invalid
  "Returns an error indicating that an invalid option was provided. The
  claim is a keyword representing a standard claim type,
  e.g. :iat, :aud, :iss, etc. The detail map provides extra information
  that is merged into the resulting error map."
  [claim option detail]
  {:pre [(keyword? claim)
         (keyword? option)
         (map? detail)
         (every? #{:provided} (keys detail))]}
  (let [path (conj [:claims] claim)]
    (lib.error/error
     (merge detail {:message "invalid option" :invalid option :claim path}))))

;; missing
;; -----------------------------------------------------------------------------

(defn missing
  "Returns an error indicating that an expected option was missing. The
  claim is a keyword representing a standard claim type,
  e.g. :iat, :aud, :iss, etc. The detail map provides extra information
  that is merged into the resulting error map."
  [claim option]
  {:pre [(keyword? claim)
         (keyword? option)]}
  (let [path (conj [:claims] claim)]
    (lib.error/error
     {:message "missing option" :missing option :claim path})))
