(ns com.kubelt.ddt.cmds
  "Define ddt command hierarchy."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.http :as ddt.http]
   [com.kubelt.ddt.cmds.ipfs :as ddt.ipfs]
   [com.kubelt.ddt.cmds.json :as ddt.json]
   [com.kubelt.ddt.cmds.json-ld :as ddt.json-ld]
   [com.kubelt.ddt.cmds.jwt :as ddt.jwt]
   [com.kubelt.ddt.cmds.path :as ddt.path]
   [com.kubelt.ddt.cmds.rdf :as ddt.rdf]
   [com.kubelt.ddt.cmds.rpc :as ddt.rpc]
   [com.kubelt.ddt.cmds.sdk :as ddt.sdk]
   [com.kubelt.ddt.cmds.wallet :as ddt.wallet]))

;; Public
;; -----------------------------------------------------------------------------

(defn init
  [yargs]
  (-> yargs
      ;; $CLI json <command>
      (.command (clj->js ddt.json/command))
      ;; $DDT http <command>
      (.command (clj->js ddt.http/command))
      ;; $DDT ipfs <command>
      (.command (clj->js ddt.ipfs/command))
      ;; $DDT json-ld <command>
      (.command (clj->js ddt.json-ld/command))
      ;; $DDT jwt <command>
      (.command (clj->js ddt.jwt/command))
      ;; $DDT path <command>
      (.command (clj->js ddt.path/command))
      ;; $DDT rdf <command>
      (.command (clj->js ddt.rdf/command))
      ;; $DDT rpc <command>
      (.command (clj->js ddt.rpc/command))
      ;; $DDT sdk <command>
      (.command (clj->js ddt.sdk/command))
      ;; $DDT wallet <command>
      (.command (clj->js ddt.wallet/command))))
