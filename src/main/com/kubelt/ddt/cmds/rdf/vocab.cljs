(ns com.kubelt.ddt.cmds.rdf.vocab
  "Convert an RDF vocabulary into a CAR file."
  {:copyright "ⓒ2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["fs" :as fs]
   ["path" :as path])
  #_(:require
     [com.kubelt.lib.car.rdf :as car.rdf]))

(defonce command
  {:command "vocab <rdf-file>"
   :aliases ["voc"]
   :desc "Generate a CAR file from an RDF vocabulary."
   :requiresArg true

   :builder (fn [^Yargs yargs]
              ;; --base-iri / -b
              (let [base-iri {:alias "b"
                              :describe "The base IRI of the vocabulary"
                              :requiresArg true
                              :string true}]
                (.option yargs "base-iri" (clj->js base-iri)))
              ;; --out-file / -o
              (let [out-file {:alias "o"
                              :describe "The output file to create"
                              :requiresArg true
                              :string true
                              :default "output.car"}]
                (.option yargs "out-file" (clj->js out-file)))
              ;; Check that input path exists and is a file.
              (.coerce yargs "rdf-file"
                       (fn [file-name]
                         (let [file-path (.resolve path file-name)]
                           (.isFile (.lstatSync fs file-path))
                           file-path))))

   :handler (fn [args]
              (let [{:keys [base-iri rdf-file out-file]}
                    (js->clj args :keywordize-keys true)]
                (println "building" out-file "from" rdf-file)

                ;; TODO pass along out-file argument. Derive default
                ;; from input file name.
                ;;(car.rdf/convert-vocab rdf-file base-iri)
                ))})
