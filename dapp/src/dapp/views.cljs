(ns dapp.views
  (:require
   [re-frame.core :as re-frame]
   [dapp.subs :as subs]
   ))

(defn header
  []
  [:div.px-6
   [:h1.text-2xl.mt-6 "Reagent + Tailwind starter"]])

(defn main-panel []
  (let [name (re-frame/subscribe [::subs/name])]
    [:div
     (header)
     [:h1
      "Hello there from " @name]
     ]))
