(ns com.kubelt.rpc.oort-test
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
  {:before (lib.test-utils/import-wallet-fixture t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-mnemonic t.commons/test-wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-password)})

(deftest claims-test
  (testing "test sdk claims"
    (async done
           (go
             (try
               (let [sys (<p! (sdk/init (t.commons/oort-config)))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-password))
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))]
                 (is (= ["3id.enter"] (<p! (sdk.oort/claims& kbt (get-in kbt [:crypto/wallet :wallet/address]))))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(comment
;;
  (t/run-tests)
  ;;
  )
