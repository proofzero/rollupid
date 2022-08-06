(ns com.kubelt.rpc.auth-test
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async use-fixtures] :as t])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.test-utils :as lib.test-utils]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.rpc.test-commons :as t.commons]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.oort :as sdk.oort]))


(use-fixtures :once
  {:before  (lib.test-utils/create-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)})

(deftest rpc-core-auth-test
  (testing "rpc auth test"
    (async done
           (go
              (try
               (let [config (t.commons/oort-config)
                     sys (<p! (sdk/init config))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     core (:wallet/address wallet)
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet) {}))]
                 (is (= {} (-> sys :crypto/session :vault/tokens)))
                 (is (map? (get-in kbt [:crypto/session :vault/tokens core])))
                 (is (= :kubelt.type/vault (get-in kbt [:crypto/session :com.kubelt/type])))
                 (is (string? (get-in kbt [:crypto/session :vault/tokens* core]))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))
