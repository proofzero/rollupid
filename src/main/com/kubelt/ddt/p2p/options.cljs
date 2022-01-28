(ns com.kubelt.ddt.p2p.options
  "Common options for p2p sub-command."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Defaults
;; -----------------------------------------------------------------------------

(def host-default
  "127.0.0.1")

(def port-default
  9061)

;; Options
;; -----------------------------------------------------------------------------

(def host-name
  "host")

(def host-config
  #js {:alias "h"
       :describe "p2p service host"
       :requiresArg true
       :demandOption "service host is required"
       :string true
       :nargs 1
       :default host-default})

(def port-name
  "port")

(def port-config
  #js {:alias "p"
       :describe "p2p service port"
       :requiresArg true
       :demandOption "service port is required"
       :number true
       :nargs 1
       :default port-default})

;; Both --host, --port are required (NB: since defaults are supplied you
;; won't receive an error if not supplied by user).
(def required-options
  #js [host-name
       port-name])

;; Public
;; -----------------------------------------------------------------------------

(defn options
  [yargs]
  ;; Add --host option
  (.option yargs host-name host-config)
  ;; Add --port option
  (.option yargs port-name port-config)
  ;; Indicate which options must be provided
  (.demandOption yargs required-options)
  ;; Pretend like this is functional
  yargs)
