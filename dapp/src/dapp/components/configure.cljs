(ns dapp.components.configure
  (:require
   [re-frame.core :as re-frame]
   [reitit.frontend.easy :as rfe]
   [dapp.wallet :as wallet]
   ))

(defn render
  [props]
  [:div.min-h-full.flex.items-center.justify-center.py-12.px-4.sm:px-6.lg:px-8
   [:div.relative.px-4.w-full.max-w-md.h-full.md:h-auto.max-w-md.w-full.space-y-8
    [:div.p-6
    [:p.text-sm.font-normal.text-gray-500.dark:text-gray-400
     "Hello my friend"]
    ]
    ]])
