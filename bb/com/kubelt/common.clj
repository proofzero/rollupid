(ns com.kubelt.common
  "Some shared data values."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


;; The name of our GPG signing key.
(def signing-key
  "release@kubelt.com")

;; The default name of a shadow-cljs configuration file.
(def shadow-file
  "shadow-cljs.edn")

;; The default name of CLJ deps configuration file.
(def deps-file
  "deps.edn")

;; The default name of a Leiningen configuration file.
(def project-file
  "project.clj")
