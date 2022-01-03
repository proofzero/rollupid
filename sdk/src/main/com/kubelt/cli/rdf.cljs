(ns com.kubelt.cli.rdf
  "CLI setup for 'rdf' sub-command."
  {:author "Kubelt, Inc."}
  (:require
   [com.kubelt.cli.rdf.data :as rdf.data]
   [com.kubelt.cli.rdf.index :as rdf.index]
   [com.kubelt.cli.rdf.supported :as rdf.supported]
   [com.kubelt.cli.rdf.vocab :as rdf.vocab]))

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
