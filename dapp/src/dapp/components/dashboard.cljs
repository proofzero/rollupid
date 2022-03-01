(ns dapp.components.dashboard
  (:require
   [dapp.utils :as utils]))

(defn render
  [props]
  ["render dashboard"]
  [:div.py-6
    [:div.max-w-7xl.mx-auto.px-4.sm:px-6.lg:px-8
     [:h-1.text-2xl.font-semibold.text-gray-900 "Dashboard"]]
    [:div.max-w-7xl.mx-auto.px-4.sm:px-6.md:px-8
     [:div.py-4
      [:div.border-4.border-dashed.border-gray-200.rounded-lg.h-96]]]])
