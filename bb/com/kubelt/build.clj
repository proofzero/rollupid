(ns com.kubelt.build
  "Various build-related utilities.")


;; env
;; -----------------------------------------------------------------------------

(defn env
  "Return an environment variable. If a default is provided, that value is
  returned whent the environment variable is not defined."
  ([s]
   (env s nil))

  ([s default]
   (or (System/getenv s) default)))

;; prop
;; -----------------------------------------------------------------------------

(defn prop
  "Return a system property. If a default is provided, that value is
  returned whent the property is defined."
  ([s]
   (prop s nil))

  ([s default]
   (or (System/getProperty s) default)))
