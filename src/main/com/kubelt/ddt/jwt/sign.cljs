(ns com.kubelt.ddt.jwt.sign
  "Invoke the JWT (sign) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.impl.jwt :as jwt]))

(defonce command
  {:command "sign"
   :desc "Sign a payload"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init)]
                (if (sdk/error? kbt)
                  (prn (:error kbt))
                  (let [payload {:foo "bar"}]
                      (println "TODO Sign payload to get JWT")
                      ;;(jwt/sign payload)
                      (sdk/halt! kbt)))))})
