(ns dapp.wallet
  (:require
   [promesa.core :as p]
   [re-frame.core :as re-frame]
   [dapp.events :as events])
  (:require
    ["web3" :as Web3]))

(defn accounts-changed
  [event]
  (prn "accounts-changed")
  (js/console.log event)
  (re-frame/dispatch :events/accounts-changed))

(defn chain-changed
  [event]
  (prn "chain-changed")
  (js/console.log event)
  (re-frame/dispatch :events/chain-changed))


(defn provider-setup []
  (prn "provider")
  (js/console.log Web3/givenProvider))
  ;; TODO: FIX THIS LISTENER
  ;((.on Web3/givenProvider) "accountsChanged" accounts-changed)
  ;((.on Web3/givenProvider) "chainChanged" chain-changed))


;; Events

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
