(ns dapp.integration.auth-test
  (:require
   [cljs.test :refer-macros [deftest is testing]]
   [day8.re-frame.test :as rf-test]
   [re-frame.core :as re-frame])
  (:require
   [com.kubelt.lib.wallet :as lib.wallet]
   [dapp.core]
   [dapp.wallet]))

(deftest init-sdk-and-wallet
  (rf-test/run-test-sync
   (re-frame/dispatch [:dapp.core/initialize-db])
   (testing "Initialize SDK context with empty wallet via dapp"
     (let [ctx (re-frame/subscribe [:dapp.wallet/ctx])
           wallet (re-frame/subscribe [:dapp.wallet/wallet])]
       (is (contains? @ctx :crypto/wallet))
       (is (lib.wallet/valid? @wallet))))))

(deftest gen-wallet-and-authenticate
  (rf-test/run-test-sync
   (re-frame/dispatch [:dapp.core/initialize-db])
   (testing "Generate wallet and authenticate"
     ;; TODO: Implement once wallet features are ported to
     ;; browser targets.
     (is (true? true)))))
