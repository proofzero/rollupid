(ns com.kubelt.github.secret
  "Work with GitHub secrets."
  (:require
   [babashka.process :as proc]
   [babashka.tasks :as tasks]
   [clojure.string :as cstr]))

;; set
;; -----------------------------------------------------------------------------

(defn set
  "Set a GitHub secret."
  [secret-name secret]
  {:pre []}
  (let [command ["gh" "secret" "set" secret-name "--body" secret]
        command (cstr/join " " command)]
    (tasks/shell command)))
