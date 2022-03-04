(ns dapp.wallet
  (:require
   [promesa.core :as p]
   [re-frame.core :as re-frame])
  (:require
    ;["@metamask/detect-provider" :as detectEthereumProvider]
    ["web3" :as Web3]))

(defn accounts-changed
  [event]
  (prn "accounts-changed")
  (js/console.log event)
  (re-frame/dispatch ::accounts-changed))

(defn chain-changed
  [event]
  (prn "chain-changed")
  (js/console.log event)
  (re-frame/dispatch ::chain-changed))


(defn provider-setup []
  (prn "provider")
  (if Web3/givenProvider
    (re-frame/dispatch [::provider-detected Web3/givenProvider])
    (throw (js/Error "No wallet provider detected")))) ;; TODO: decide on an effect for no metamask



;; TODO: subscribe to accounts changed after connected
;(p/let [provider (detectEthereumProvider)]
    ;((.on provider) "accountsChanged" accounts-changed)
    ;((.on provider) "chainChanged" chain-changed)))


;; Events

(re-frame/reg-event-db ::provider-detected
  (fn [db [_ provider]]
    (prn "provider-detected")
    (let [web3 (Web3. provider)
          current-account (.-defaultAccount (.-eth web3))]
      (prn "current-account")
      (prn current-account)
      (assoc db :provider provider :web3 web3 :current-account current-account))))

(re-frame/reg-event-fx ::connect-account
  (fn [cofx [_ wallet]]
    (prn wallet)
      ;(-> (.requestAccounts eth) 
          ;(.then #(js/console.log %)))
      {}))

(re-frame/reg-event-fx ::accounts-changed
  (fn [coeffects event]))

(re-frame/reg-event-fx ::chain-changed
  (fn [coeffects event]))

;;; Effects ;;;

;(re-frame/reg-fx ::metamask
  ;(fn []
    ;(prn "

;;; Subs ;;;

(re-frame/reg-sub ::provider
  (fn [db]
    (:provider db)))

(re-frame/reg-sub ::current-account
  (fn [db]
    (:current-account db)))
