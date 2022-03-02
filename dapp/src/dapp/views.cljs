(ns dapp.views
  (:require
   [re-frame.core :as re-frame]
   [dapp.subs :as subs]
   [dapp.components.nav :as nav]
   ))


(defn main-panel [{:keys [router]}]
  (let [current-route @(re-frame/subscribe [::subs/current-route])]
    [:div
      (nav/render {:router router :current-route current-route})
      [:main.flex-1.md:ml-64
       (when current-route
        [(-> current-route :data :view)])]]))


