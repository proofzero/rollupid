(ns dapp.views
  (:require
   [re-frame.core :as re-frame]
   [dapp.routes :as routes]
   [dapp.components.layout :as layout]))

(defn main-panel
  [_]
  (fn [{:keys [router]}]
   (let [current-route (re-frame/subscribe [::routes/current-route])]
     [layout/render {:router router
                     :current-route @current-route}])))
