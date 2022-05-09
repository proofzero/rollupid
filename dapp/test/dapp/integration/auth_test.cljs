(ns dapp.integration.auth-test
  (:require
   [cljs.test :refer-macros [deftest is testing]]
   [day8.re-frame.test :as rf-test]
   [re-frame.core :as re-frame])
  (:require
   [com.kubelt.lib.wallet :as lib.wallet]
   [dapp.core]
   [dapp.integration.test-utils :as test-utils]
   [dapp.wallet]))

(deftest init-sdk-and-wallet
  (rf-test/run-test-async
   (test-utils/sync-initialize-db)
   (testing "Initialize SDK context with empty wallet via dapp"
     (rf-test/wait-for
      [:dapp.core/init-sdk]
      (let [ctx @(re-frame/subscribe [:dapp.wallet/ctx])
            wallet @(re-frame/subscribe [:dapp.wallet/wallet])]
        (is (lib.wallet/valid? wallet))
        (is (contains? ctx :crypto/wallet)))))))

;; Requires connection to cloudflare-worker OR appropriate backend to run correctly
(deftest gen-wallet-authenticate-and-disconnect
  (rf-test/run-test-async
   (test-utils/sync-initialize-db)
   (testing "Generate wallet, authenticate with SDK and disconnect"
     (rf-test/wait-for
      [:dapp.core/init-sdk]
      (test-utils/generate-random-wallet)

      ;; Wait for authentication to succeed
      (rf-test/wait-for
       [:dapp.wallet/authenticate-success]
       (let [auth-ctx @(re-frame/subscribe [:dapp.wallet/ctx])
             {:wallet/keys [address] :as connected-wallet} @(re-frame/subscribe [:dapp.wallet/wallet])]

         ;; Ensure connected-wallet passes validation
         (is (lib.wallet/valid? connected-wallet))

         ;; Ensure connected-wallet address is the same as generated-wallet address
         (is (= (:wallet/address @test-utils/*generated-wallet*) address))

         ;; Ensure that a session with appropriate JWT token information is stored
         (is (contains? (get-in auth-ctx [:crypto/session :vault/tokens]) address))
         (let [jwt-path [:crypto/session :vault/tokens address]]
           (is (map? (get-in auth-ctx (conj jwt-path :header))))
           (is (contains? (get-in auth-ctx (conj jwt-path :header)) :alg))
           (is (string? (get-in auth-ctx (conj jwt-path :signature))))
           (is (string? (get-in auth-ctx (conj jwt-path :token))))
           (is (map? (get-in auth-ctx (conj jwt-path :claims))))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :aud))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :exp))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :iat))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :iss))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :json-rpc-url))
           (is (contains? (get-in auth-ctx (conj jwt-path :claims)) :sub))))

       (test-utils/disconnect-wallet))))))
