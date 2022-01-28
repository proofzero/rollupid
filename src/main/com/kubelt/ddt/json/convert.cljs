(ns com.kubelt.ddt.json.convert
  "Convert an input JSON file to a CAR."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["fs" :as fs]
   ["path" :as path])
  (:require
   [com.kubelt.lib.bag :as bag]
   [com.kubelt.lib.bag.dag :as bag.dag]
   [com.kubelt.lib.bag.node :as bag.node]
   [com.kubelt.lib.car :as car]
   [com.kubelt.lib.ipld :as ipld]
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "convert <pack-file>"
   :desc "Convert a pack JSON to CAR file"
   :requiresArg true

   :builder (fn [^Yargs yargs]
              ;; --out-file / -o
              (let [out-file {:alias "o"
                              :describe "The output file to create"
                              :requiresArg true
                              :string true
                              :default "output.car"}]
                (.option yargs "out-file" (clj->js out-file)))

              ;; Check that input path exists and is a file.
              (.coerce yargs "pack-file"
                       (fn [file-name]
                         (let [file-path (.resolve path file-name)]
                           (.isFile (.lstatSync fs file-path))
                           file-path)))

              yargs)

   :handler (fn [args]
              (let [{:keys [pack-file out-file]}
                    (js->clj args :keywordize-keys true)
                    ;; Returns an error map if an initialization error
                    ;; occurred.
                    kbt (sdk/init)]
                (if (sdk/error? kbt)
                  (prn (:error kbt))
                  (let [;; Read in pack file contents.
                        data (js/JSON.parse (.readFileSync fs pack-file))
                        ;; Construct BAG containing a single DAG, which has a
                        ;; single root node containing the pack data.
                        ;;
                        ;; TODO FIXME doesn't work (can't ipfs dag import)
                        ;; with codec-json. Should it? Error message:
                        ;;   $ ipfs dag import output.car
                        ;;   Error: unrecognized object type: 297
                        data-bag (bag/from-json data #_{:ipld/codec ipld/codec-json})]
                    ;; Write the BAG to the given output file.
                    (car/write-to-file! data-bag out-file)
                    ;; TODO this is a no-op for the invocation; don't bother
                    ;; init/halt SDK?
                    (sdk/halt! kbt)))))})
