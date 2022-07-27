(ns dapp.integration.dashboard-test
  (:require
   [cljs.test :refer-macros [deftest is testing]]
   [day8.re-frame.test :as rf-test]
   [re-frame.core :as re-frame])
  (:require
   [dapp.core]
   [dapp.integration.test-utils :as test-utils]
   [dapp.pages.dashboard :as dashboard]
   [dapp.wallet]))

;; Requires connection to cloudflare-worker OR appropriate backend to run correctly
(deftest dashboard-views-test
  (rf-test/run-test-async
   (test-utils/sync-initialize-db)

   (rf-test/wait-for
    [:dapp.core/init-sdk]

    (testing "Ensure `connect-wallet` component is shown prior to login"
      (let [logged-in? @(re-frame/subscribe [:dapp.wallet/logged-in?])
            [top-level-div _ _ connect-wallet] (dashboard/dashboard-content logged-in?)]
        (is (false? logged-in?))
        (is (= top-level-div :div.dashboard-content))
        ;; Assert correct component is rendered
        (is (= connect-wallet [dashboard/connect-wallet]))))

    (testing "Ensure `root-core-details` component is shown after login"
      (test-utils/generate-random-wallet)

      ;; Wait for authentication to succeed
      (rf-test/wait-for
       [:dapp.wallet/authenticate-success]
       (let [logged-in? @(re-frame/subscribe [:dapp.wallet/logged-in?])
             [top-level-div _ _ root-core-details] (dashboard/dashboard-content logged-in?)]
         (is (true? logged-in?))
         (is (= top-level-div :div.dashboard-content))
         ;; Assert correct component is rendered
         (is (= root-core-details [dashboard/root-core-details])))

       (test-utils/disconnect-wallet))))))
