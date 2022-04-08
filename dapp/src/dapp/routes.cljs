(ns dapp.routes
  (:require
   [re-frame.core :as re-frame]
   [reitit.frontend :as rf]
   [reitit.coercion.spec :as rss]
   [reitit.frontend.easy :as rfe]
   [reitit.frontend.controllers :as rfc]
   [reitit.frontend.easy :as rfe]
   [dapp.components.settings :as settings]
   [dapp.pages.cores :as cores]
   [dapp.pages.dashboard :as dashboard]
   [dapp.pages.reports :as reports]
   [dapp.utils :as utils]
   [taoensso.timbre :as log])
   (:require
   ["@heroicons/react/outline" :refer (ChartBarIcon, FolderIcon, HomeIcon)]
   ))

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
       :start (fn [& params](log/info "Entering home page"))
       ;; Teardown can be done here.
       :stop  (fn [& params] (log/info "Leaving home page"))}]}]
   ["cores"
    {:name      ::cores
     :view      cores/render
     :controllers
     [{;; Initialization
       :start (fn [& _params](log/info "Entering Cores page"))
       ;; Teardown
       :stop  (fn [& _params] (log/info "Leaving Cores page"))}]}]
   ["reports"
    {:name      ::reports
     :view      reports/render
     :controllers
     [{;; Initialization
       :start (fn [& _params](log/info "Entering Reports page"))
       ;; Teardown
       :stop  (fn [& _params] (log/info "Leaving Reports page"))}]}]
   ["settings"
    {:name      ::settings
     :view      settings/render
     :link-text "Settings"
     :icon ChartBarIcon
     :controllers
     [{:start (fn [& params] (log/info "Entering sub-page 1"))
       :stop  (fn [& params] (log/info "Leaving sub-page 1"))}]}]])

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
