(ns dapp.subs
  (:require
   [re-frame.core :as re-frame]))

;;; Subscriptions ;;;

(re-frame/reg-sub ::current-route
  (fn [db]
    (:current-route db)))

