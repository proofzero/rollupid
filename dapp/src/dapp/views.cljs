(ns dapp.views
  (:require
   [reagent.core :as r]
   [reitit.frontend :as rf]
   [reitit.coercion.schema :as rsc]
   [re-frame.core :as re-frame]
   [dapp.subs :as subs]
   [dapp.components.layout :as layout]
   [dapp.components.dashboard :as dashboard]
   [dapp.components.settings :as settings]))

;; match routes atom
(defonce match (r/atom nil))

(defn log-fn [& params]
  (fn [_]
    (prn params)))

(def routes
  (rf/router
    ["/"
      ["" 
        {:name ::dashboard
        :view dashboard/render
        :controllers [{:start (log-fn "start" "dashboad controller")
                       :stop (log-fn "stop" "dashboard controller")}]}]
      ["settings"
        {:name ::settings
        :view settings/render}]]
    {:data {:controllers [{:start (log-fn "start" "root-controller")
                           :stop (log-fn "stop" "root controller")}]
            :coercion rsc/coercion}}))

(defn header
  []
  [:div.px-6
   [:h1.text-2xl.mt-6 "Reagent + Tailwind starter"]])

(defn main-panel []
  ;(let [name (re-frame/subscribe [::subs/name])]
    [:div
     (if @match
       (let [view (:view (:data @match))]
         (layout/render view @match)))])


