(ns com.kubelt.sdk.v1.oort-test
  (:require
   [cljs.core.async :refer [go <!]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async use-fixtures] :as t])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.rpc :as lib.rpc]
   [com.kubelt.lib.util :as lib.util]
   [com.kubelt.lib.test-utils :as lib.test-utils]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.rpc.test-commons :as t.commons]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.oort :as sdk.oort]))

#_(use-fixtures :once
  {:before  (lib.test-utils/create-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/wallet-name t.commons/wallet-password)})

(deftest use-test-wallet
  (testing "use wallet using CI secrets"
    (async done
           (go
             (try
               (let [mnemonic (get (lib.util/environment) "METAMASKID_RECOVERY_PHRASE")
                     wallet-password (get (lib.util/environment) "METAMASK_PASSWORD")
                     wallet-name "tangrammer_wallet"
                     app-name t.commons/app-name
                     config (t.commons/oort-config)
                     sys (<p! (sdk/init config))]
                 (is (= wallet-name (<! (lib.test-utils/import-wallet app-name wallet-name mnemonic wallet-password))))
                 (let [wallet (<p! (wallet/load& app-name wallet-name wallet-password))
                       kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))]
                   (is (= ["3id.enter"] (<p! (sdk.oort/claims& kbt (get-in kbt [:crypto/wallet :wallet/address])))))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))
