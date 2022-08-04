(ns dapp.components.layout
  (:require
   [dapp.components.header :as header]
   [dapp.components.sidebar :as sidebar]
   [re-frame.core :as re-frame]))

(defn render
  [_]
  (fn [{:keys [router current-route]}]
    (let [logged-in? (re-frame/subscribe [:dapp.wallet/logged-in?])]
      [:div.app-container
       {:class "w-full flex flex-row"}

       ;; Sidebar
       [sidebar/render router current-route]

       ;; App page
       [:div.content-container
        {:class "w-4/5 flex flex-col"}
        [header/render @logged-in?]
        (when current-route
          [(-> current-route :data :view)])]])))
