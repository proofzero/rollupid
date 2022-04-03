(ns com.kubelt.ddt
  "The entry-point for the Kubelt Development CLI tool."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   ["yargs" :as yargs :refer [Yargs]])
  (:require
   [clojure.set :as cset]
   [clojure.string :as str])
  (:require
   [com.kubelt.ddt.cmds :as ddt.cmds]))

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
