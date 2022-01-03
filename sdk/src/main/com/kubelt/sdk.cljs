(ns com.kubelt.sdk
  "Entry point for the Kubelt SDK."
  {:copyright "©2021 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.v1 :as sdk.v1]
   [com.kubelt.sdk.v1.workspace :as sdk.v1.workspace]))

;; Entrypoint
;; -----------------------------------------------------------------------------
;; This is the entry point for the SDK.

;; The SDK is intended to work in multiple contexts, including:
;; - ClojureScript applications
;; - Node.js applications
;; - Web applications
;;
;; Each of these values defined below are exposed by the generated
;; library to enable access to the corresponding version of the
;; API. The (init) function accepts configuration options and
;;
;; To use the SDK from ClojureScript:
;;
;;   (:require [com.kubelt.sdk.v1] :as sdk)
;;   (def kbt (sdk/init {...})
;;   (kbt/do-something)
;;   (sdk/halt! kbt)
;;
;; To use the SDK from a web application:
;;
;;   TODO
;;
;; To use the library from Node.js:
;;
;;   const kbt = require("kubelt");
;;   const sdk = kubelt.v1.init({...});
;;   kbt.v1.workspace.available(sdk);
;;   kbt.v1.halt(sdk);

(def node-v1
  #js {:init sdk.v1/init-js
       :halt sdk.v1/halt-js!

       ;; resource

       ;; workspace
       :workspace #js {:available sdk.v1.workspace/available-js}})
