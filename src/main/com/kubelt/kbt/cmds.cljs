(ns com.kubelt.kbt.cmds
  "Define the kbt command hierarchy."
  {:author "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.kbt.cmds.workspace :as cmds.workspace]))

;; Public
;; -----------------------------------------------------------------------------

(defn init
  [^js yargs]
  (-> yargs
      ;; $CLI workspace <command>
      (.command (clj->js cmds.workspace/command))))
