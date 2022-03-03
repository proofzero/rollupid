(ns dapp.core
  (:require
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [dapp.routes :as routes]
   [dapp.events :as events]
   [dapp.views :as views]
   [dapp.config :as config]
   [dapp.wallet :as wallet]
   ))


(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel {:router routes/router}] root-el)))

(defn init []
  (re-frame/clear-subscription-cache!)
  (re-frame/dispatch-sync [::events/initialize-db])
  (dev-setup)
  (wallet/provider-setup)
  (routes/init-routes!)
  (mount-root))

