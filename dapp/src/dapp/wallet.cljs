; Wallet
(ns dapp.wallet
  (:require
   [promesa.core :as p]
   [re-frame.core :as re-frame])
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

(def provider-options
  {:network "mainnet"
   :cacheProvider false
   :theme "dark"
   :providerOptions {:walletlink {:package CoinbaseWalletSDK :options {:appName "Kubelt"}}}})

(defn accounts-changed
  "Helper function that dispatches an account changed event"
  [event]
  (prn "accounts-changed")
  (js/console.log event)
  (re-frame/dispatch ::accounts-changed))

(defn chain-changed
  "Helper function that dispatches a chain changed event"
  [event]
  (prn "chain-changed")
  (js/console.log event)
  (re-frame/dispatch ::chain-changed))


(defn provider-setup
  "Setup the wallet db or throw an error if no provider is available"
  []
  (prn "provider-setup")
  (let [web3-modal (Web3Modal. (clj->js provider-options))]
    (let [provider (Web3/givenProvider)]
      (if provider
        (do
          (re-frame/dispatch [::provider-detected provider])
          (re-frame/dispatch [::modal-ready web3-modal]))
        (throw (js/Error "No wallet provider detected")))))) ;; TODO: decide on an effect for no metamask

;; TODO: subscribe to accounts changed after connected
;(p/let [provider (detectEthereumProvider)]
    ;((.on provider) "accountsChanged" accounts-changed)
    ;((.on provider) "chainChanged" chain-changed)))

;; Events

; Bootstrap the db when a provider is detected
(re-frame/reg-event-db ::provider-detected
  (fn [db [_ provider]]
    (prn "provider-detected")
    (let [web3 (Web3. provider)
          ; TODO: replace with check for JWT session
          current-account (.-defaultAccount (.-eth web3))] 
      (prn "current-account")
      (prn current-account)
      (assoc db :provider provider :web3 web3 :current-account current-account))))

; Bootstrap the db when a provider is detected
(re-frame/reg-event-db ::modal-ready
  (fn [db [_ web3-modal]]
    (prn "modal-ready")
    (js/console.log web3-modal)
    (assoc db :modal web3-modal)))

; Pop up the modal
(re-frame/reg-event-db ::web3-modal
  (fn [db _]
    (prn "pop open modal")
    (js/console.log (clj->js provider-options))
    (let [modal (Web3Modal. (clj->js provider-options))]
      (.clearCachedProvider modal)
      (p/let [provider (.connect modal)]
        (js/console.log provider)
        (js/console.log modal)
        ))))


;Handle a connection to different wallets and kick off the zk-auth
(re-frame/reg-event-db ::connect-account
  (fn [db [_ wallet]]
    (prn wallet)
    (let [web3 ^js/Web3 (:web3 db)
          eth (.-eth web3)]
      (prn "providers list") 
      (js/console.log (.-providers eth))
      (-> (.requestAccounts eth) 
        (.then (fn [accounts] 
                 ; TODO: 
                 ; - check for which account is selected
                 ; - call the SDK "login"
                 (prn "accounts")
                 (js/console.log (first accounts))
                 (assoc db :current-account (first accounts))))))))

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
