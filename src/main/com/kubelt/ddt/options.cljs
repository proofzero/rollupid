(ns com.kubelt.ddt.options
  "Common options various sub-commands."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; Defaults
;; -----------------------------------------------------------------------------

(def host-default
  "127.0.0.1")

(def port-default
  9061)

;; Options
;; -----------------------------------------------------------------------------

(def tls-name
  "tls")

(def tls-config
  #js {:describe "make request with(out) TLS"
       :boolean true})

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

(def wallet-name
  "wallet")

(def wallet-config
  #js {:alias "w"
       :describe "a wallet name"
       :requiresArg true
       :demandOption "wallet must be specified"
       :string true
       :nargs 1})

;; All of these options are required. NB: the options with supplied
;; defaults won't cause an error if not supplied by user.
(def required-options
  #js [host-name
       port-name
       wallet-name])

;; Public
;; -----------------------------------------------------------------------------

(defn options
  [yargs]
  ;; Add --(no-)tls option
  (.option yargs tls-name tls-config)
  ;; Add --host option
  (.option yargs host-name host-config)
  ;; Add --port option
  (.option yargs port-name port-config)
  ;; Add --wallet option
  (.option yargs wallet-name wallet-config)
  ;; Indicate which options must be provided
  (.demandOption yargs required-options)
  ;; Pretend like this is functional
  yargs)
