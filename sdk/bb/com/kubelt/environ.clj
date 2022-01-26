(ns com.kubelt.build
  "Environment variable utilities.")

(defn get-env
  "Return an environment variable value."
  [s]
  (System/getenv s))
