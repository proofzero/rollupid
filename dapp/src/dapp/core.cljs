(ns dapp.core
  (:require
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [dapp.config :as config]
   [dapp.views :as views]
   [dapp.routes :as routes]))


(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel {:router routes/router}] root-el)))

;;; Effects ;;;

(def kubelt-db
  {:name "kubelt"
   :user nil})

;;; Events ;;;

(re-frame/reg-event-db ::initialize-db
  (fn [db _]
    (if db
      db
      kubelt-db)))


(re-frame/reg-sub ::current-user
  (fn [db]
    (:current-user db)))

(defn init []
  (re-frame/clear-subscription-cache!)
  (re-frame/dispatch-sync [::initialize-db])
  (dev-setup)
  (routes/init-routes!)
  (mount-root))
