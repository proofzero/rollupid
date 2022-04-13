(ns com.kubelt.ddt.cmds.rdf.index
  "Generate a CAR index of supported RDF vocabularies."
  {:copyright "ⓒ2022 Kubelt, Inc." :license "Apache 2.0"})

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
