(defproject kubelt/sdk "0.0.1"
  :description "Kubelt SDK"
  :url "https://kubelt.com/"

  :source-paths
  ["src/main"]

  :dependencies
  [;; always use "provided" for Clojure(Script)
   [org.clojure/clojure "1.11.1" :scope "provided"]
   [org.clojure/clojurescript "1.11.54" :scope "provided"]
   [thheller/shadow-cljs "2.19.0" :scope "provided"]
   ;; a Clojure/Script library for word case conversions
   [camel-snake-kebab/camel-snake-kebab "0.4.3"]
   ;; errors as simple, actionable, generic information
   [com.cognitect/anomalies "0.1.12"]
   ;; data format for conveying values between applications
   [com.cognitect/transit-cljs "0.8.269"]
   ;; a pure Clojure/Script logging library
   [com.taoensso/timbre "5.2.1"]
   ;; fast, idiomatic pretty-printer
   [fipp/fipp "0.6.26"]
   ;; Promise library for Clojure(Script)
   [funcool/promesa "8.0.450"]
   ;; a micro-framework for building data-driven applications
   [integrant/integrant "0.8.0"]
   ;; fast JSON encoding and decoding
   [metosin/jsonista "0.3.5"]
   ;; data-driven schemas for Clojure/Script
   [metosin/malli "0.8.4"]
   ;; tools for working with command line arguments
   [org.clojure/tools.cli "1.0.206"]])
