; Wallet
(ns dapp.wallet
  (:require
   [com.kubelt.sdk.v1.core :as sdk.core]
   [re-frame.core :as re-frame]
   [taoensso.timbre :as log]))

; The wallet ns manages events and effects related to wallet based auth
; and interacts with the SDK to fulfill a full ZK-Auth
; NOTE:
; - Should we port this entire thing the SDK to as part of the web targets?n accounts-changed
; - The node and other headless targets should be have a facility to bootstrap itself via API TOKEN / JWT

(defn accounts-changed
  "Helper function that dispatches an account changed event"
  [event]
  (re-frame/dispatch ::accounts-changed))

(defn chain-changed
  "Helper function that dispatches a chain changed event"
  [event]
  (re-frame/dispatch ::chain-changed))


;; TODO: subscribe to accounts changed after connected
;(p/let [provider (detectEthereumProvider)]
    ;((.on provider) "accountsChanged" accounts-changed)
    ;((.on provider) "chainChanged" chain-changed)))

;; Events

;; `::connect-account` isn't used but is kept for reference
;; when working on integrating new providers
;Handle a connection to different wallets and kick off the zk-auth
#_(re-frame/reg-event-db
 ::connect-account
  (fn [db [_ wallet]]
    (let [web3 ^js/Web3 (:web3 db)
          _ (log/debug {:msg "connect-account" :wallet wallet :web3 web3})
          eth (.-eth web3)]
      (log/debug {:msg "eth provider" :provider (.-providers eth)})
      (-> (.requestAccounts eth)
        (.then (fn [accounts]
                 ; TODO:
                 ; - check for which account is selected
                 ; - call the SDK "login"
                 (log/debug {:msg "found account" :account (first accounts)})
                 (assoc db :current-account (first accounts))))))))

(re-frame/reg-event-fx
 ::set-current-wallet
 (fn [{:keys [db]} [_ wallet]]
   (let [ctx (:sdk/ctx db)
         ;; `sdk.core/set-wallet` also validates the structure of `wallet`
         new-ctx (sdk.core/set-wallet ctx wallet)]
     {:db db
      :dispatch [::authenticate! new-ctx]})))

(re-frame/reg-event-db
 ::authenticate!
 (fn [db [_ new-ctx]]
   (let [wallet-address (get-in new-ctx [:crypto/wallet :wallet/address])]
     (-> (sdk.core/authenticate! new-ctx wallet-address)
         (.then (fn [auth-ctx]
                  (log/info {:message (str "Authenticating a new wallet with address: " wallet-address)})
                  ;; must dispatch the next event within the promise
                  (re-frame/dispatch [::authenticate-success auth-ctx])))
         (.catch (fn [err]
                   (log/error {:message (str "Failed to authenticate with wallet address: " wallet-address)
                               :error err})
                   (re-frame/dispatch [::authenticate-failure wallet-address err]))))
     ;; needs to return `db` since this is a `reg-event-db`
     db)))

(re-frame/reg-event-db
 ::authenticate-success
 (fn [db [_ auth-ctx]]
   (assoc db :sdk/ctx auth-ctx)))

(re-frame/reg-event-db
 ::authenticate-failure
 (fn [db [_ wallet-address err]]
   (assoc-in db [:sdk/ctx :errors wallet-address] err)))

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
