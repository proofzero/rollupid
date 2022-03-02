(ns dapp.routes
  (:require
   [re-frame.core :as re-frame]
   [reitit.frontend :as rf]
   [reitit.coercion.spec :as rss]
   [reitit.frontend.easy :as rfe]
   [dapp.events :as events]
   [dapp.components.dashboard :as dashboard]
   [dapp.components.settings :as settings])
   (:require
   ["@heroicons/react/outline" :refer (ChartBarIcon, FolderIcon, HomeIcon)]
   ))

(defn log-fn [& params]
  (fn [_]
    (prn params)))

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
       :start (fn [& params](log-fn "Entering home page"))
       ;; Teardown can be done here.
       :stop  (fn [& params] (log-fn "Leaving home page"))}]}]
   ["settings"
    {:name      ::settings
     :view      settings/render
     :link-text "Settings"
     :icon ChartBarIcon
     :controllers
     [{:start (fn [& params] (log-fn "Entering sub-page 1"))
       :stop  (fn [& params] (log-fn "Leaving sub-page 1"))}]}]])

(defn on-navigate [new-match]
  (when new-match
    (re-frame/dispatch [::events/navigated new-match])))

(def router
  (rf/router
    routes
    {:data {:coercion rss/coercion}}))

(defn init-routes! []
  (js/console.log "initializing routes")
  (rfe/start!
    router
    on-navigate
    {:use-fragment true}))

