(ns dapp.events
  (:require
   [promesa.core :as p]
   [re-frame.core :as re-frame]
   [dapp.db :as ddb]
   [reitit.frontend.controllers :as rfc]
   [reitit.frontend.easy :as rfe])
  (:require
    ["web3" :as Web3]))
;;; Effects ;;;

;; Triggering navigation from events.

(re-frame/reg-fx :push-state
  (fn [route]
    (apply rfe/push-state route)))

;;; Events ;;;

(re-frame/reg-event-db ::initialize-db
  (fn [db _]
    (if db
      db
      ddb/default-db)))

(re-frame/reg-event-fx ::push-state
  (fn [_ [_ & route]]
    {:push-state route}))

(re-frame/reg-event-db ::navigated
  (fn [db [_ new-match]]
    (let [old-match   (:current-route db)
          controllers (rfc/apply-controllers (:controllers old-match) new-match)]
      (assoc db :current-route (assoc new-match :controllers controllers)))))


(re-frame/reg-event-fx ::accounts-changed
  (fn [coeffects event]))

(re-frame/reg-event-fx ::chain-changed
  (fn [coeffects event]))

(re-frame/reg-event-fx ::connect-metamask
  (fn [coeffects event]
    (prn coeffects)
    (prn event)
    



    (let [web3 (Web3. (.-givenProvider Web3))
          eth (.-eth web3)]
      (prn "provider")
      (js/console.log (.-givenProvider Web3))
      ;(js/console.log (.getAccounts eth))
      ;; web.eth.getAccounts(console.log)
      ;(js/console.log (.getAccounts eth))
      ;; web3.eth.getAccount().then(...)
      (-> (.requestAccounts eth) 
          (.then #(js/console.log %)))
      {}
    )))


;(re-frame/reg-event-db ::connect-user
  ;(fn [db user]
    ;(assoc db :current-user user)))
    
