(ns com.kubelt.cli
  "The entry-point for the Kubelt Development CLI tool."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["yargs" :as yargs :refer [Yargs]])
  (:require
   [clojure.set :as cset]
   [clojure.string :as str])
  (:require
   [com.kubelt.cli.courtyard :as cli.courtyard]
   [com.kubelt.cli.crypto :as cli.crypto]
   [com.kubelt.cli.http :as cli.http]
   [com.kubelt.cli.json-ld :as cli.json-ld]
   [com.kubelt.cli.jwt :as cli.jwt]
   [com.kubelt.cli.p2p :as cli.p2p]
   [com.kubelt.cli.path :as cli.path]
   [com.kubelt.cli.rdf :as cli.rdf]
   [com.kubelt.cli.sdk :as cli.sdk]
   [com.kubelt.cli.wallet :as cli.wallet]))

;; NB: when you encounter an error like:
;;   "Cannot infer target type in expression"
;; when using yargs, provide the ^js type hint to cause the compiler to
;; generate proper externs. For example, when defining a command:
;;
;; :builder (fn [^js yargs]
;;               (-> yargs
;;                   (.command (clj->js some.ns/command))
;;                   (.demandCommand)))})

;; Definitions
;; -----------------------------------------------------------------------------

(def copyright-year
  2022)

(def copyright-author
  "Kubelt Inc.")

(def epilogue
  (str "Copyright ©" copyright-year ", " copyright-author))

;; Arguments
;; -----------------------------------------------------------------------------

(defn parse-args
  [args]
  (let [js-args (clj->js (sequence args))
        args (-> ^js yargs
                 ;; Set up our commands.

                 ;; $CLI courtyard <command>
                 (.command (clj->js cli.courtyard/command))

                 ;; $CLI crypto <command>
                 (.command (clj->js cli.crypto/command))
                 ;; $CLI http <command>
                 (.command (clj->js cli.http/command))
                 ;; $CLI json-ld <command>
                 (.command (clj->js cli.json-ld/command))
                 ;; $CLI jwt <command>
                 (.command (clj->js cli.jwt/command))
                 ;; $CLI p2p <command>
                 (.command (clj->js cli.p2p/command))
                 ;; $CLI path <command>
                 (.command (clj->js cli.path/command))
                 ;; $CLI rdf <command>
                 (.command (clj->js cli.rdf/command))
                 ;; $CLI sdk <command>
                 (.command (clj->js cli.sdk/command))
                 ;; $CLI wallet <command>
                 (.command (clj->js cli.wallet/command))

                 ;; Display a summary line.
                 (.epilogue epilogue)
                 ;; Display help information.
                 (.help)
                 ;; Reject non-explicit arguments.
                 (.strict)
                 ;; Tell us what command to run!
                 (.demandCommand 1)
                 ;; Parse the CLI arguments and return a #js {}.
                 (.parse js-args))]
    (-> args
        ;; The parsed arguments are returned as a #js object. Convert to
        ;; a CLJS map with keywords as keys.
        (js->clj :keywordize-keys true)
        ;; yargs adds the keys as "nil" when you use .option, but :or
        ;; works better if you don't even have the key
        ;;(dissoc-nil :file :f :constant)
        (cset/rename-keys {:_ :args}))))

;; Entrypoint
;; -----------------------------------------------------------------------------

(defn main
  [& args]
  (parse-args args))
