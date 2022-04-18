(ns com.kubelt.lib.jwt.claim
  "Claim-related utilities."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]))

;; missing
;; -----------------------------------------------------------------------------

(defn missing
  "Returns an error indicating that an expected claim was missing from a
  token under evaluation. The claim is a keyword representing a standard
  claim type, e.g. :iat, :aud, :iss, etc. The detail map provides extra
  information that is merged into the resulting error map."
  [claim detail]
  {:pre [(keyword? claim)
         (map? detail)
         (every? #{:expected} (keys detail))]}
  (let [path (conj [:claims] claim)]
    (lib.error/error
     (merge detail {:message "missing claim" :missing path}))))

;; failed
;; -----------------------------------------------------------------------------

(defn failed
  "Returns an error indicating that a claim check failed. The claim is a
  keyword representing a standard claim type, e.g. :iat, :aud, :iss,
  etc. The message is a human-readable description of the error. The
  detail map provides extra information that is merged into the
  resulting error map."
  [claim message detail]
  {:pre [(keyword? claim)
         (string? message)
         (map? detail)
         (every? #{:expected :received} (keys detail))]}
  (let [path (conj [:claims] claim)]
    (lib.error/error
     (merge detail {:message message :failed path}))))

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
     (merge detail {:message "invalid option" :option option}))))
