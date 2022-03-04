(ns dapp.views
  (:require
   [re-frame.core :as re-frame]
   [dapp.routes :as routes]
   [dapp.wallet :as wallet]
   [dapp.components.layout :as layout]
   [dapp.components.login :as login]
   ))


(defn main-panel [{:keys [router]}]
  (let [current-route @(re-frame/subscribe [::routes/current-route])
        current-account @(re-frame/subscribe [::wallet/current-account])
        provider @(re-frame/subscribe [::wallet/provider])]
     (cond 
       current-account
          (layout/render {:router router :current-route current-route})
       (and provider (not current-account))
          (login/render nil)
       :else
          (login/render nil))))


