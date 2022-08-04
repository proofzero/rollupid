(ns dapp.integration.test-utils
  (:require
   [cljs.test :refer-macros [is]]
   [day8.re-frame.test :as rf-test]
   [re-frame.core :as re-frame])
  (:require
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.lib.wallet.shared :as lib.wallet.shared])
  (:require
   ["web3modal$default" :as Web3Modal]))

(def ^:dynamic *generated-wallet* (atom {}))

(defn sync-initialize-db
  []
  (re-frame/dispatch-sync [:dapp.core/initialize-db]))

(defn generate-random-wallet
  []
  (let [modal (Web3Modal. (clj->js {:network "testnet"
                                    :cacheProvider true}))]
    (.then (lib.wallet.shared/random-wallet)
           (fn [generated-wallet]
             (is (lib.wallet/valid? generated-wallet))
             ;; Need access to generated-wallet value outside of promise
             (reset! *generated-wallet* generated-wallet)
             ;; Set the modal & current wallet in re-frame app-db
             (re-frame/dispatch [:dapp.wallet/set-web3-modal modal])
             (re-frame/dispatch [:dapp.wallet/set-current-wallet generated-wallet])))))

(defn disconnect-wallet
  []
  (re-frame/dispatch [:dapp.wallet/disconnect
                      (:wallet/address @*generated-wallet*)])
  (rf-test/wait-for
   [:dapp.wallet/disconnect-success]
   (let [{:keys [web3-modal] :as _db} @(re-frame/subscribe [:dapp.core/db])
         disconnected-ctx @(re-frame/subscribe [:dapp.wallet/ctx])]
     ;; Ensure no modal exists in the app-db
     (is (nil? web3-modal))
     ;; Ensure no session information remains in the app-db
     (is (nil? (get-in disconnected-ctx [:crypto/session
                                         :vault/tokens
                                         (:wallet/address @*generated-wallet*)]))))))
