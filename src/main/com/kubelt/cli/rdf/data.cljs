(ns com.kubelt.cli.rdf.data
  "Convert a JSON-LD data file into a CAR file."
  {:author "Kubelt, Inc." :copyright 2021 :license "UNLICENSED"}
  (:require
   ["fs" :as fs]
   ["path" :as path]))

(defonce command
  {:command "data <jsonld-file>"
   :desc "Generate a CAR file from a JSON-LD data file."
   :requiresArg true

   :builder (fn [^Yargs yargs]
              ;; --base-iri / -b
              ;; (let [base-iri {:alias "b"
              ;;                 :describe "The base IRI of the vocabulary"
              ;;                 :requiresArg true
              ;;                 :string true}]
              ;;   (.option yargs "base-iri" (clj->js base-iri)))

              ;; --out-file / -o
              (let [out-file {:alias "o"
                              :describe "The output file to create"
                              :requiresArg true
                              :string true
                              :default "data.car"}]
                (.option yargs "out-file" (clj->js out-file)))

              ;; Check that input path exists and is a file.
              (.coerce yargs "jsonld-file"
                       (fn [file-name]
                         (let [file-path (.resolve path file-name)]
                           (.isFile (.lstatSync fs file-path))
                           file-path))))

   :handler (fn [args]
              (let [{:keys [jsonld-file out-file]}
                    (js->clj args :keywordize-keys true)]
                (println "building" out-file "from" jsonld-file)
                ;; TODO write CAR to output file.
                ;;(car.rdf/convert-data jsonld-file out-file)
                ))})
