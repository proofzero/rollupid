(ns dapp.components.layout
  (:require
   [dapp.components.sidebar :as sidebar]))

(defn render [{:keys [router current-route]}]
  [:div.main-container
   {:class "w-full flex flex-row"}

   ;; Sidebar
   [sidebar/render router current-route]

   ;; App page
   [:<>
    (when current-route
      [(-> current-route :data :view)])]])
