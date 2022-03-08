(ns dapp.components.layout
  (:require
   [dapp.components.nav :as nav]))

(defn render [{:keys [router current-route]}]
  [:div
   (nav/render router current-route)
   [:main.flex-1.md:ml-64
    (when current-route
      [(-> current-route :data :view)])]])

