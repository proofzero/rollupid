(ns com.kubelt.ddt.cmds.jwt.sign
  "Invoke the JWT (sign) method."
  {:copyright "©2022 Kubelt, Inc." :license "Apache 2.0"}
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.jwt :as jwt]))

(defonce command
  {:command "sign"
   :desc "Sign a payload"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println "TODO Sign payload to get JWT")
              #_(jwt/sign payload))})
