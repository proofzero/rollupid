; Wallet
(ns dapp.wallet
  (:require
   [com.kubelt.sdk.v1 :as sdk.v1]
   [com.kubelt.sdk.v1.oort :as sdk.oort]
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

(re-frame/reg-event-db
 ::set-web3-modal
 (fn [db [_ modal]]
   (assoc db :web3-modal modal)))

(re-frame/reg-event-db
 ::set-current-wallet
 (fn [db [_ wallet]]
   (let [ctx (:sdk/ctx db)]
     ;; `sdk.oort/set-wallet` also validates the structure of `wallet`
     (.then (sdk.oort/set-wallet ctx wallet)
            (fn [new-ctx]
              (re-frame/dispatch [::authenticate! new-ctx])))
     db)))

(re-frame/reg-event-db
 ::authenticate!
 (fn [db [_ new-ctx]]
   (let [wallet-address (get-in new-ctx [:crypto/wallet :wallet/address])]
     (-> (sdk.oort/authenticate& new-ctx)
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

;; Two events for disconnect for testing async completion via re-frame-test
(re-frame/reg-event-fx
 ::disconnect
 (fn [{:keys [db]} [_ wallet-address]]
   (log/info {:message (str "Disconnecting from address: " wallet-address)})
   ;; Clear the provider from the web3-modal object
   (.clearCachedProvider (:web3-modal db))
   ;; Reset the SDK context to `init` state
   (.then (sdk.v1/init {:app/name "kubelt-dapp"})
          (fn [ctx]
            (re-frame/dispatch [:dapp.core/init-sdk ctx])))
   {:db (assoc db :sdk/ctx {})
    :dispatch [::disconnect-success]}))

(re-frame/reg-event-db
 ::disconnect-success
 (fn [db _]
   (dissoc db :web3-modal)))

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

(re-frame/reg-sub
 ::ctx
 (fn [db]
   (:sdk/ctx db)))

(re-frame/reg-sub
 ::wallet
 (fn [db]
   (get-in db [:sdk/ctx :crypto/wallet])))

(re-frame/reg-sub
 ::logged-in?
 :<- [::ctx]
 :<- [::wallet]
 (fn [[ctx {:wallet/keys [address] :as _wallet}] _]
   (sdk.oort/logged-in? ctx address)))
