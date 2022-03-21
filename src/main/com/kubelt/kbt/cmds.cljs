(ns com.kubelt.kbt.cmds
  "Define the kbt command hierarchy."
  {:author "ⓒ2022 Kubelt Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.kbt.cmds.workspace :as cmds.workspace]))

;; Public
;; -----------------------------------------------------------------------------

(defn init
  [^js yargs]
  (-> yargs
      ;; $CLI workspace <command>
      (.command (clj->js cmds.workspace/command))))
