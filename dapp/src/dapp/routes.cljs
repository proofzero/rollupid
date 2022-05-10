(ns dapp.routes
  (:require
   [re-frame.core :as re-frame]
   [reitit.frontend :as rf]
   [reitit.coercion.spec :as rss]
   [reitit.frontend.easy :as rfe]
   [reitit.frontend.controllers :as rfc]
   [dapp.pages.apps :as apps]
   [dapp.pages.dashboard :as dashboard]
   [dapp.pages.reports :as reports]
   [taoensso.timbre :as log])
   (:require
   ["@heroicons/react/outline" :refer (HomeIcon)]))

;;; Events ;;;

(re-frame/reg-event-fx ::push-state
  (fn [_ [_ & route]]
    {:push-state route}))

(re-frame/reg-event-db ::navigated
  (fn [db [_ new-match]]
    (let [old-match   (:current-route db)
          controllers (rfc/apply-controllers (:controllers old-match) new-match)]
      (assoc db :current-route (assoc new-match :controllers controllers)))))

;;; Effects ;;;

;; Triggering navigation from events.

(re-frame/reg-fx :push-state
  (fn [route]
    (apply rfe/push-state route)))

;;; Subscriptions ;;;

(re-frame/reg-sub ::current-route
  (fn [db]
    (:current-route db)))

;;; Routes ;;;

(defn href
  "Return relative url for given route. Url can be used in HTML links."
  ([k]
   (href k nil nil))
  ([k params]
   (href k params nil))
  ([k params query]
   (rfe/href k params query)))

(def routes
  ["/"
   [""
    {:name      ::dashboard
     :view      dashboard/render
     :link-text "Dashboard"
     :icon HomeIcon
     :controllers
     [{;; Do whatever initialization needed for dashboard page
       ;; I.e (re-frame/dispatch [::events/load-something-with-ajax])
       :start (fn [& params](log/trace "Entering home page"))
       ;; Teardown can be done here.
       :stop  (fn [& params] (log/trace "Leaving home page"))}]}]
   ["apps"
    {:name      ::apps
     :view      apps/render
     :controllers
     [{;; Initialization
       :start (fn [& _params](log/trace "Entering Apps page"))
       ;; Teardown
       :stop  (fn [& _params] (log/trace "Leaving Apps page"))}]}]
   ["reports"
    {:name      ::reports
     :view      reports/render
     :controllers
     [{;; Initialization
       :start (fn [& _params](log/trace "Entering Reports page"))
       ;; Teardown
       :stop  (fn [& _params] (log/trace "Leaving Reports page"))}]}]])

(defn on-navigate [new-match]
  (when new-match
    (re-frame/dispatch [::navigated new-match])))

(def router
  (rf/router
    routes
    {:data {:coercion rss/coercion}}))

(defn init-routes! []
  (rfe/start!
    router
    on-navigate
    {:use-fragment true}))
