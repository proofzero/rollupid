(ns dapp.subs
  (:require
   [re-frame.core :as re-frame]))

;;; Subscriptions ;;;

(re-frame/reg-sub ::current-route
  (fn [db]
    (:current-route db)))

(re-frame/reg-sub ::current-user
  (fn [db]
    (:current-user db)))


