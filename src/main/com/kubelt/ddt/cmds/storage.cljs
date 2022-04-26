(ns com.kubelt.ddt.cmds.storage
  "CLI setup for 'storage' sub-command."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.ddt.cmds.storage.create :as storage.create]
   [com.kubelt.ddt.cmds.storage.restore :as storage.restore]
   [com.kubelt.ddt.cmds.storage.store :as storage.store]))

(defonce command
  {:command "storage <command>"
   :desc "Work with SDK storage"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js storage.create/command))
                  (.command (clj->js storage.store/command))
                  (.command (clj->js storage.restore/command))
                  (.demandCommand)))})
