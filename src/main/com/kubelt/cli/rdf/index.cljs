(ns com.kubelt.cli.rdf.index
  "Generate a CAR index of supported RDF vocabularies."
  {:author "Kubelt, Inc." :copyright 2021 :license "UNLICENSED"})

(defonce command
  {:command "index <car-files>"
   :aliases ["idx"]
   :desc "Generate CAR index from a set of RDF vocabulary CARs."
   :requiresArg true
   :builder (fn [yargs]
              yargs)
   :handler (fn [args]
              ;; TODO
              (println "building CAR index from RDF vocabulary CARs..."))})
