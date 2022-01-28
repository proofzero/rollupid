(ns com.kubelt.ddt.rdf
  "CLI setup for 'rdf' sub-command."
  {:author "Kubelt, Inc."}
  (:require
   [com.kubelt.ddt.rdf.data :as rdf.data]
   [com.kubelt.ddt.rdf.index :as rdf.index]
   [com.kubelt.ddt.rdf.supported :as rdf.supported]
   [com.kubelt.ddt.rdf.vocab :as rdf.vocab]))

(defonce command
  {:command "rdf <command>"
   :desc "Process RDF data"
   :builder (fn [^js yargs]
              (-> yargs
                  (.command (clj->js rdf.vocab/command))
                  (.command (clj->js rdf.index/command))
                  (.command (clj->js rdf.data/command))
                  (.command (clj->js rdf.supported/command))
                  (.demandCommand)))})
