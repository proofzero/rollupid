(ns com.kubelt.ddt.cmds.rdf.supported
  "List RDF formats that can be parsed."
  {:copyright "ⓒ2022 Proof Zero Inc." :license "Apache 2.0"})

(defonce command
  {:command "supported"
   :desc "List supported RDF formats."

   :builder (fn [^Yargs yargs]
              (let [prioritized {:alias "p"
                                 :describe "Include parsing priorities"
                                 :requiresArg false
                                 :boolean true
                                 :default false}]
                (.option yargs "prioritized" (clj->js prioritized))))

   :handler (fn [args]
              (let [{:keys [prioritized]} (js->clj args :keywordize-keys true)]
                (println "TODO list parseable RDF types")
                ;;(car.rdf/supported-types prioritized)
                ))})
