(ns dapp.views
  (:require
   [re-frame.core :as re-frame]
   [dapp.subs :as subs]
   [dapp.components.layout :as layout]
   [dapp.components.login :as login]
   ))


(defn main-panel [{:keys [router]}]
  (let [current-route @(re-frame/subscribe [::subs/current-route])
        current-user @(re-frame/subscribe [::subs/current-user])]
     (if current-user
      (layout/render {:router router :current-route current-route})
      (login/render nil))))


