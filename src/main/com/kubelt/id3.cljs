(ns com.kubelt.id3
  "Entry point for the Kubelt three-id support."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.sdk.v1 :as sdk.v1]
   [com.kubelt.sdk.v1.workspace :as sdk.v1.workspace]))

;; Entrypoint
;; -----------------------------------------------------------------------------
;; This is the entry point for the three-id support.

;;
;; To use the library from Node.js:
;;
;;   const kbtId3 = require("kubeltId3");
;;   const id3 = kbtId3.v1.init({...});
;;   kbtId3.v1.workspace.available(id3);
;;   kbtId3.v1.halt(id3);

(defn web-v1
  []
  ;; TODO
  (println "web-v1"))

(def node-v1
  #js {:init sdk.v1/init-js
       :halt sdk.v1/halt-js!
       ;; workspace
       :workspace #js {:available sdk.v1.workspace/available-js!}})
