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
    (throw (js/Error "No wallet provider detected"))))



;; TODO: subscribe to accounts changed after connected
;(p/let [provider (detectEthereumProvider)]
    ;((.on provider) "accountsChanged" accounts-changed)
    ;((.on provider) "chainChanged" chain-changed)))


;; Events

(re-frame/reg-event-db ::provider-detected
  (fn [db [_ provider]]
    (prn "provider-detected")
    (update db :provider assoc :provider provider :web3 (Web3. provider))))

(re-frame/reg-event-fx ::connect-metamask
  (fn [coeffects event]
    (prn "metamask")
    (prn coeffects)
    (prn event)
    



    (let [web3 (Web3. Web3/givenProvider)
          eth (.-eth web3)]
      (prn "provider")
      ;(js/console.log (.getAccounts eth))
      ;; web.eth.getAccounts(console.log)
      ;(js/console.log (.getAccounts eth))
      ;; web3.eth.getAccount().then(...)
      (-> (.requestAccounts eth) 
          (.then #(js/console.log %)))
      {}
    )))

(re-frame/reg-event-fx ::connect-coinbase
  (fn [coeffects event]
    (prn "coinnbase")
    (prn coeffects)
    (prn event)
    ))


(re-frame/reg-event-fx ::accounts-changed
  (fn [coeffects event]))

(re-frame/reg-event-fx ::chain-changed
  (fn [coeffects event]))

;;; Subs ;;;

(re-frame/reg-sub ::current-account
  (fn [db]
    (:current-account db)))

