(ns com.kubelt.rpc.test-commons
  (:require
   [com.kubelt.lib.util :as lib.util :refer [node-env environment]]))

(def app-name "com.kubelt.ddt.js")
(def wallet-name "auth_test")
(def wallet-password "auth_foo_pw")

(def test-wallet-name "test_metamask")
(def test-wallet-password (get (environment) "METAMASK_PASSWORD"))
(def test-wallet-mnemonic (get (environment) "METAMASKID_RECOVERY_PHRASE"))

(defn ci-env
  []
  (some? (get-in (node-env) [:environment "GITHUB_ACTIONS"])))

(defn oort-config
  "return p2p config based on env"
  []
  (if (ci-env)
    {:app/name "kubelt-test"
     :oort/scheme :https
     :oort/host "oort-devnet.admin1337.workers.dev"
     :oort/port  443}
    {}))
