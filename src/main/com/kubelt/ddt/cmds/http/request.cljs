(ns com.kubelt.ddt.cmds.http.request
  "Invoke the SDK (init) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"})

(defonce command
  {:command "request"
   :desc "Perform HTTP request"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [#_args]
              (println "TODO perform request"))})
