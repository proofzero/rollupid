(ns com.kubelt.ddt
  "The entry-point for the Kubelt Development CLI tool."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["yargs" :as yargs :refer [Yargs]])
  (:require
   [clojure.set :as cset]
   [clojure.string :as str])
  (:require
   [com.kubelt.ddt.cmds :as ddt.cmds]
   [com.kubelt.lib.promise :as lib.promise]))

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
  "Proof Zero Inc.")

(def epilogue
  (str "Copyright ©" copyright-year ", " copyright-author))

;; Arguments
;; -----------------------------------------------------------------------------

(defn parse-args
  [args]
  (let [js-args (clj->js (sequence args))]
    (-> ^js yargs
        ;; Set up our commands.
        (ddt.cmds/init)
        ;; Display a summary line.
        (.epilogue epilogue)
        ;; Display help information.
        (.help)
        ;; Reject non-explicit arguments.
        (.strict)
        ;; Tell us what command to run!
        (.demandCommand 1)
        ;; Parse the CLI arguments and return a #js {}.
        (.parse js-args))))

;; Entrypoint
;; -----------------------------------------------------------------------------

(defn main
  [& args]
  (parse-args args))
