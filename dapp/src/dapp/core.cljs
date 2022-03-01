(ns dapp.core
  (:require
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [reitit.frontend.easy :as rfe]
   [reitit.frontend.controllers :as rfc]
   [dapp.events :as events]
   [dapp.views :as views]
   [dapp.config :as config]
   ))

(defn dev-setup []
  (when config/debug?
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (re-frame/clear-subscription-cache!)
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel] root-el)))

(defn init []
  (re-frame/dispatch-sync [::events/initialize-db])
  (dev-setup)
  ;; router setup
  (rfe/start!
    views/routes
    (fn [new-match]
      (swap! views/match (fn [old-match]
                     (if new-match
                       (assoc new-match :controllers (rfc/apply-controllers (:controllers old-match) new-match))))))
    {:use-fragment true})
  (mount-root))

