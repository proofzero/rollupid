(ns com.kubelt.ddt.cmds.json-ld.parse
  "Parse a JSON-LD file to RDF/cljs format."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   ["fs" :as fs]
   ["path" :as path])
  (:require
   [clojure.pprint :refer [pprint]]
   [fipp.edn :as pp])
  (:require
   [com.kubelt.lib.rdf.json-ld :as rdf.json-ld]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "parse <in-file>"
   :desc "Parse a JSON-LD file"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              ;; --out-file / -o
              (let [out-file {:alias "o"
                              :describe "The output file to create"
                              :requiresArg true
                              :string true}]
                (.option yargs "out-file" (clj->js out-file)))

              ;; --pretty
              (let [pretty {:describe "Pretty print output"
                            :requiresArg false
                            :type :boolean
                            :default false}]
                (.option yargs "pretty" (clj->js pretty)))

              ;; Check that input path exists and is a file. Returns the
              ;; path of the file.
              (.coerce yargs "in-file"
                       (fn [file-name]
                         (let [file-path (.resolve path file-name)]
                           (.isFile (.lstatSync fs file-path))
                           file-path))))

   :handler (fn [args]
              (let [{:keys [in-file out-file pretty]}
                    (js->clj args :keywordize-keys true)]
                (letfn [;; Callback for fs.writeFile(). Called when file
                        ;; content has been written to disk.
                        (on-done [err]
                          (if err
                            (js/console.err err)
                            (js/console.log "data written to" out-file)))
                        ;; Pretty-print data into a string.
                        (pprint-str [data]
                          (with-out-str (pp/pprint data)))
                        ;; Write data to file. If pretty flag is true,
                        ;; data will be formatted.
                        (write-file [file-path data]
                          (let [options #js {"encoding" "utf-8"}
                                data-str (if pretty
                                           (pprint-str data)
                                           (pr-str data))]
                            (.writeFile fs file-path data-str options on-done)))
                        ;; Write data to standard output. If pretty flag
                        ;; is true then data will be pretty-printed.
                        (write-stdout [data]
                          (if pretty
                            ;; FIXME this isn't printing
                            ;; correctly. Using (pprint) works, and this
                            ;; *used* to work before setting
                            ;; up (with-out-str ...) above.
                            (pp/pprint data)
                            (prn data)))]
                  ;; Use require("fs").promises for a promisified file
                  ;; read function.
                  (-> (.readFile (.-promises fs) in-file)
                      (.then js/JSON.parse)
                      (.then rdf.json-ld/js->graph)
                      (.then (fn [quads]
                               (if out-file
                                 (write-file out-file quads)
                                 (write-stdout quads))))
                      (.catch (fn [err]
                                (js/console.err err)))))))})
