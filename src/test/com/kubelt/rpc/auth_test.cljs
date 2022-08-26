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
  {:before (lib.test-utils/create-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)})

(deftest rpc-core-auth-test
  (testing "rpc auth test"
    (async done
           (go
             (try
               (let [wallet (<p! (wallet/load& t.commons/app-name t.commons/wallet-name t.commons/wallet-password))
                     address (:wallet/address wallet)
                     config (assoc (t.commons/oort-config) :crypto/wallet wallet)
                     sys (<p! (sdk/init config))
                     permissions {}
                     network {:network/blockchain "ethereum"
                              :network/chain "goerli"
                              :network/chain-id 5}
                     kbt (<p! (sdk.oort/authenticate& sys permissions network))]
                 (is (= :kubelt.type/vault (get-in kbt [:crypto/session :com.kubelt/type]))
                     "The stored token collection has expected type tag")
                 (is (= {} (-> sys :crypto/session :vault/tokens))
                     "SDK is created with no tokens")
                 (is (map? (get-in kbt [:crypto/session :vault/tokens address]))
                     "Stored JWT is available as a decomposed map")
                 (is (string? (get-in kbt [:crypto/session :vault/tokens* address]))
                     "Stored JWT is available as a string"))
               (catch js/Error err
                 (do (is false err)))
               (finally (done)))))))
