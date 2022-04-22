(ns dapp.integration.auth-test
  (:require
   [cljs.test :refer-macros [deftest is testing]]
   [day8.re-frame.test :as rf-test]
   [re-frame.core :as re-frame])
  (:require
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.lib.wallet.shared :as lib.wallet.shared]
   [dapp.core]
   [dapp.wallet])
  (:require
   ["web3modal$default" :as Web3Modal]))

(deftest init-sdk-and-wallet
  (rf-test/run-test-sync
   (re-frame/dispatch [:dapp.core/initialize-db])
   (testing "Initialize SDK context with empty wallet via dapp"
     (let [ctx (re-frame/subscribe [:dapp.wallet/ctx])
           wallet (re-frame/subscribe [:dapp.wallet/wallet])]
       (is (contains? @ctx :crypto/wallet))
       (is (lib.wallet/valid? @wallet))))))

;; Requires connection to cloudflare-worker OR appropriate backend to run correctly
(deftest gen-wallet-authenticate-and-disconnect
  (rf-test/run-test-async
   (re-frame/dispatch-sync [:dapp.core/initialize-db])
   (testing "Generate wallet, authenticate with SDK and disconnect"
     (let [generated-wallet (atom {})
           modal (Web3Modal. (clj->js {:network "testnet"
                                       :cacheProvider true}))]
       (.then (lib.wallet.shared/random-wallet)
              (fn [generated-wallet*]
                (is (lib.wallet/valid? generated-wallet*))
                ;; need access to generated-wallet value outside of promise
                (reset! generated-wallet generated-wallet*)
                ;; Set the modal & current wallet in re-frame app-db
                (re-frame/dispatch [:dapp.wallet/set-web3-modal modal])
                (re-frame/dispatch [:dapp.wallet/set-current-wallet generated-wallet*])))

       ;; Wait for authentication to succeed
       (rf-test/wait-for
        [:dapp.wallet/authenticate-success]
        (let [auth-ctx @(re-frame/subscribe [:dapp.wallet/ctx])
              {:wallet/keys [address] :as connected-wallet} @(re-frame/subscribe [:dapp.wallet/wallet])]
          ;; Ensure connected-wallet passes validation
          (is (lib.wallet/valid? connected-wallet))
          ;; Ensure connected-wallet address is the same as generated-wallet address
          (is (= (:wallet/address @generated-wallet) address))
          ;; Ensure that a session with appropriate JWT token information is stored
          (is (contains? (get-in auth-ctx [:crypto/session :vault/tokens]) address))
          (let [jwt-path [:crypto/session :vault/tokens address]]
            (is (and (some? (get-in auth-ctx (conj jwt-path :header)))
                     (some? (get-in auth-ctx (conj jwt-path :claims)))
                     (some? (get-in auth-ctx (conj jwt-path :token)))
                     (some? (get-in auth-ctx (conj jwt-path :signature)))))))

        ;; Dispatch disconnect event and wait for it to succeed
        (re-frame/dispatch [:dapp.wallet/disconnect (:wallet/address @generated-wallet)])
        (rf-test/wait-for
         [:dapp.wallet/disconnect-success]
         (let [{:keys [web3-modal] :as _db} @(re-frame/subscribe [:dapp.core/db])
               disconnected-ctx @(re-frame/subscribe [:dapp.wallet/ctx])]
           ;; Ensure no modal exists in the app-db
           (is (nil? web3-modal))
           ;; Ensure no session information remains in the app-db
           (is (nil? (get-in disconnected-ctx [:crypto/session :vault/tokens (:wallet/address @generated-wallet)]))))))))))
