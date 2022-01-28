(ns com.kubelt.ddt
  "The entry-point for the Kubelt Development CLI tool."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["yargs" :as yargs :refer [Yargs]])
  (:require
   [clojure.set :as cset]
   [clojure.string :as str])
  (:require
   [com.kubelt.ddt.json :as ddt.json]
   [com.kubelt.ddt.crypto :as ddt.crypto]
   [com.kubelt.ddt.http :as ddt.http]
   [com.kubelt.ddt.json-ld :as ddt.json-ld]
   [com.kubelt.ddt.jwt :as ddt.jwt]
   [com.kubelt.ddt.p2p :as ddt.p2p]
   [com.kubelt.ddt.path :as ddt.path]
   [com.kubelt.ddt.rdf :as ddt.rdf]
   [com.kubelt.ddt.sdk :as ddt.sdk]
   [com.kubelt.ddt.wallet :as ddt.wallet]))

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

                 ;; $CLI json <command>
                 (.command (clj->js ddt.json/command))

                 ;; $DDT crypto <command>
                 (.command (clj->js ddt.crypto/command))
                 ;; $DDT http <command>
                 (.command (clj->js ddt.http/command))
                 ;; $DDT json-ld <command>
                 (.command (clj->js ddt.json-ld/command))
                 ;; $DDT jwt <command>
                 (.command (clj->js ddt.jwt/command))
                 ;; $DDT p2p <command>
                 (.command (clj->js ddt.p2p/command))
                 ;; $DDT path <command>
                 (.command (clj->js ddt.path/command))
                 ;; $DDT rdf <command>
                 (.command (clj->js ddt.rdf/command))
                 ;; $DDT sdk <command>
                 (.command (clj->js ddt.sdk/command))
                 ;; $DDT wallet <command>
                 (.command (clj->js ddt.wallet/command))

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
