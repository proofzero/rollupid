(ns com.kubelt.sdk.v1.workspace
  "Defines the API for Kubelt workspaces."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"})


(defn available!
  "Return a list of available workspaces."
  [sys]
  (println "listing available workspaces"))

(defn available-js!
  ""
  [sys]
  (available! sys))
