(ns com.kubelt.rpc.test-commons
  (:require
   [com.kubelt.lib.util :as lib.util :refer [node-env environment]]))

(def app-name "com.kubelt.test")
(def wallet-name "auth_test")
(def wallet-password "auth_foo_pw")

(def test-wallet-name "test_metamask")
(def test-wallet-password (get (environment) "METAMASK_PASSWORD"))
(def test-wallet-mnemonic (get (environment) "METAMASKID_RECOVERY_PHRASE"))

(defn ci-env
  "Returns true if running in a GitHub Actions workflow, and false
  otherwise."
  []
  (some? (get-in (node-env) [:environment "GITHUB_ACTIONS"])))

(defn oort-config
  "Return oort config based on environment."
  []
  (if (ci-env)
    {:app/name app-name
     :log/level :debug
     :oort/scheme :https
     :oort/host "oort-devnet.kubelt.com"
     :oort/port 443}

    ;; Other test against a locally running instance of oort.
    {:app/name app-name
     :log/level :debug}))
