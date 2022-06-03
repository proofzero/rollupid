(ns com.kubelt.rpc.test-commons
  (:require [com.kubelt.lib.util :as lib.util :refer [node-env]]))

(def app-name "com.kubelt.ddt.js")
(def wallet-name "auth_test")
(def wallet-password "auth_foo_pw")

(defn ci-env
  []
  (some? (get-in (node-env) [:environment "GITHUB_ACTIONS"])))

;; TODO use "oort-devnet.admin1337.workers.dev" as host when CORS issue abated
(defn p2p-config
  "return p2p config based on env"
  []
  (if (ci-env)
      {:p2p/scheme :https
       :app/name "kubelt-test"
       :p2p/host "oort-devnet.admin1337.workers.dev"
       :p2p/port  443}
    {}))
