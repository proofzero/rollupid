(ns dapp.views
  (:require
   [reagent.core :as r]
   [reitit.frontend :as rf]
   [re-frame.core :as re-frame]
   [dapp.subs :as subs]
   [dapp.components.layout :as layout]
   [dapp.components.dashboard :as dashboard]
   [dapp.components.settings :as settings]))

;; match routes atom
(defonce match (r/atom nil))

(def routes
  (rf/router
    ["/"
      ["" 
        {:name ::dashboard
        :view dashboard/render}]
      ["/settings"
        {:name ::settings
        :view settings/render}]]))

(defn header
  []
  [:div.px-6
   [:h1.text-2xl.mt-6 "Reagent + Tailwind starter"]])

(defn main-panel []
  ;(let [name (re-frame/subscribe [::subs/name])]
    [:div
     (if @match
       (let [view (:view (:data @match))]
         (layout/render view)))])
