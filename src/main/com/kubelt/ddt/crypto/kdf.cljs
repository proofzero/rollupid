(ns com.kubelt.ddt.crypto.kdf
  "Invoke the SDK (init) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [com.kubelt.misc.kdf :as kdf]))

(defonce command
  {:command "kdf"
   :desc "Key derivation prototype"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (println (kdf/do-eet)))})
