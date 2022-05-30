(ns com.kubelt.rpc.auth-test
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async] :as t]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.core :as sdk.core]))

(def app-name "com.kubelt.ddt.js")
(def wallet-name "auth_test")
(def wallet-password "auth_foo_pw")

(defn- create-wallet [app-name wallet-name wallet-password]
  (go
    (log/debug "creating-wallet: " wallet-name)
    (try
      (let [w (<p! (wallet/init& app-name wallet-name wallet-password))]
        (is true "wallet created")
        w)
      (catch js/Error err (do (is false err) err)))))

(defn delete-wallet [app-name wallet-name wallet-password]
  (go
    (log/debug "deleting-wallet: " wallet-name)
    (try
      (let [can-decrypt? (<p! (wallet/can-decrypt?& app-name wallet-name wallet-password))]
        (log/debug "can-decrypt?: " can-decrypt?)
        (when can-decrypt?
          (let [deleted (<p! (wallet/delete!& app-name wallet-name))]
            (log/debug :deleted deleted)
            true)))
      (catch js/Error err (do (is false err) err)))))

(deftest rpc-core-auth-test
  (testing "rpc auth test"
    (async done
           (go
             (try
               (<! (create-wallet app-name wallet-name wallet-password))
               (catch js/Error err (js/console.log err)))
             (try
               (let [config {:p2p/scheme :https
                             :p2p/host "oort-devnet.admin1337.workers.dev"
                             :p2p/port  443}
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& app-name wallet-name wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.core/authenticate& (assoc sys :crypto/wallet wallet)))]
                 (is (= {} (-> sys :crypto/session :vault/tokens)))
                 (is (map? (get-in kbt [:crypto/session :vault/tokens core])))
                 (is (string? (get-in kbt [:crypto/session :vault/tokens* core]))))
               (catch js/Error err (js/console.log err))
               (finally
                 (try
                   (<! (delete-wallet app-name wallet-name wallet-password))
                   (catch js/Error err (js/console.log err))
                   (finally (done)))))))))

(comment
  (t/run-tests)
  )
