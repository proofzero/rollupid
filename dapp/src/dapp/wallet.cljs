; Wallet
(ns dapp.wallet
  (:require
   [com.kubelt.sdk.v1.core :as sdk.core]
   [re-frame.core :as re-frame]
   [taoensso.timbre :as log])
  (:require
    ["web3modal$default" :as Web3Modal]
    ["@coinbase/wallet-sdk" :as CoinbaseWalletSDK]
    ["walletlink" :as WalletLink]
    ["web3" :as Web3]))

; The wallet ns manages events and effects related to wallet based auth
; and interacts with the SDK to fulfill a full ZK-Auth
; NOTE:
; - Should we port this entire thing the SDK to as part of the web targets?n accounts-changed
; - The node and other headless targets should be have a facility to bootstrap itself via API TOKEN / JWT

(defn accounts-changed
  "Helper function that dispatches an account changed event"
  [event]
  (log/info "accounts-changed")
  (js/console.log event)
  (re-frame/dispatch ::accounts-changed))

(defn chain-changed
  "Helper function that dispatches a chain changed event"
  [event]
  (log/info "chain-changed")
  (js/console.log event)
  (re-frame/dispatch ::chain-changed))


;; TODO: subscribe to accounts changed after connected
;(p/let [provider (detectEthereumProvider)]
    ;((.on provider) "accountsChanged" accounts-changed)
    ;((.on provider) "chainChanged" chain-changed)))

;; Events

; Bootstrap the db when a provider is detected
(re-frame/reg-event-db ::provider-detected
  (fn [db [_ provider]]
    (log/info "provider-detected")
    (log/info provider)
    (let [web3 (Web3. provider)
          ; TODO: replace with check for JWT session
          current-account (.-defaultAccount (.-eth web3))]
      (log/info "current-account")
      (log/info current-account)
     (assoc db :provider provider :web3 web3 :current-account current-account))))

; Bootstrap the db when a provider is detected
(re-frame/reg-event-db ::modal-ready
  (fn [db [_ web3-modal]]
    (log/info "modal-ready")
    (js/console.log web3-modal)
    (assoc db :modal web3-modal)))

; Pop up the modal
(re-frame/reg-event-db ::web3-modal
  (fn [db _ provider]
    (log/info {:msg "provider received" :provider provider })
    (let [ctx  (re-frame/dispatch [::provider-detected (assoc db :provider provider)])]
      (re-frame/dispatch [::connect-account ctx]))))


;Handle a connection to different wallets and kick off the zk-auth
(re-frame/reg-event-db ::connect-account
  (fn [db [_ wallet]]
    (log/info {:wallet wallet})
    (let [web3 ^js/Web3 (:web3 db)
          _ (log/info {:web3 web3 :db db})
          eth (.-eth web3)]
      (log/info "providers list")
      (js/console.log (.-providers eth))
      (-> (.requestAccounts eth)
        (.then (fn [accounts]
                 ; TODO:
                 ; - check for which account is selected
                 ; - call the SDK "login"
                 (log/info "accounts")
                 (js/console.log (first accounts))
                 (assoc db :current-account (first accounts))))))))
;; TODO remove fx version if not needed? 
(re-frame/reg-event-fx
 ::set-current-wallet
 (fn [{:keys [db]} [_ wallet]]
   (let [new-ctx (sdk.core/set-wallet (:sdk/ctx db) wallet)]
     {:dispatch [::authenticate new-ctx]})))

(re-frame/reg-event-db
 ::authenticate
 (fn [db [_ new-ctx]]
   (let [wallet-address (get-in new-ctx [:crypto/wallet :wallet/address])]
     (assoc db :sdk/ctx (sdk.core/authenticate! new-ctx wallet-address)))))

; TODO
; Handle the account changed event
(re-frame/reg-event-fx ::accounts-changed
  (fn [coeffects event]
    ))

; TODO
; Handle the chain changed event
(re-frame/reg-event-fx ::chain-changed
  (fn [coeffects event]
    ))

;;; Effects ;;;


;;; Subs ;;;

(re-frame/reg-sub ::provider
  (fn [db]
    (:provider db)))

(re-frame/reg-sub ::current-account
  (fn [db]
    (:current-account db)))
