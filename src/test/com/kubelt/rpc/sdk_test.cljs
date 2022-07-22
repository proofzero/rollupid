(ns com.kubelt.rpc.sdk-test
  "Tests for sdk.v1 api, placed here to run only in node env"
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [cljs.core.async :refer [go]]
   [cljs.core.async.interop :refer-macros [<p!]]
   [cljs.test :refer-macros [deftest is testing async use-fixtures] :as t])
  (:require
   [malli.core :as m]
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.test-utils :as lib.test-utils]
   [com.kubelt.lib.wallet.node :as wallet]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.rpc.test-commons :as t.commons]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.spec.config :as spec.config]
   [com.kubelt.spec.vault :as spec.vault]
   [com.kubelt.sdk.v1.oort :as sdk.oort]))

(use-fixtures :once
  {:before (lib.test-utils/import-wallet-fixture t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-mnemonic t.commons/test-wallet-password)
   :after (lib.test-utils/delete-wallet-fixture t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-password)})

(deftest sdk-store-restore-specs-test
  (testing "test store, restore specs"
    (async done
           (go
             (try
               (let [sys (<p! (sdk/init (t.commons/oort-config)))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-password))
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))
                     store-result (:data (<p! (sdk/store& kbt)))]
                 (is (= (set (keys store-result)) #{:vault :options}))
                 (is (m/validate com.kubelt.spec.vault/vault (:vault store-result)))
                 (is (m/validate spec.config/stored-system-config (:options store-result)))
                 (is (m/validate spec.config/restored-system (<p! (sdk/restore& sys)))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))

(deftest restore-claims-and-rpc-test
  (testing "test restore claims and rpc"
    (async done
           (go
             (try
               (let [sys (<p! (sdk/init (t.commons/oort-config)))
                     wallet (<p! (wallet/load& t.commons/app-name t.commons/test-wallet-name t.commons/test-wallet-password))
                     kbt (<p! (sdk.oort/authenticate& (assoc sys :crypto/wallet wallet)))
                     _ (<p! (sdk/store& kbt))
                     restored-system (<p! (sdk/restore& sys))]
                 (is (= ["3id.enter"] (<p! (sdk.oort/claims& restored-system (get-in restored-system [:crypto/wallet :wallet/address]))))))
               (catch js/Error err (do
                                     (log/error err)
                                     (is false err)))
               (finally (done)))))))


