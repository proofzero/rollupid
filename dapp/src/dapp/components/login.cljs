(ns dapp.components.login
  (:require
   [reagent.core :as r]))

(defn render
  [props]
  [:div.min-h-full.flex.items-center.justify-center.py-12.px-4.sm:px-6.lg:px-8
   [:div.relative.px-4.w-full.max-w-md.h-full.md:h-auto.max-w-md.w-full.space-y-8
    [:div.p-6
    [:p.text-sm.font-normal.text-gray-500.dark:text-gray-400
     "Connect with one of our available wallet providers."]
    [:ul.my-4.space-y-3
     [:li
      [:a.flex.items-center.p-3.text-base.font-bold.text-gray-900.bg-gray-50.rounded-lg.hover:bg-gray-100.group.hover:shadow.dark:bg-gray-600.dark:hover:bg-gray-500.dark:text-white
       {:href "#"}
       ;; metamask
       [:img.h-4 {:src "/images/metamask.webp"}]
       [:span.flex-1.ml-3.whitespace-nowrap "MetaMask"]
       [:span.inline-flex.items-center.justify-center.px-2.py-0.5.ml-3.text-xs.font-medium.text-gray-500.bg-gray-200.rounded.dark:bg-gray-700.dark:text-gray-400
        "Popular"]]]
     [:li
      [:a.flex.items-center.p-3.text-base.font-bold.text-gray-900.bg-gray-50.rounded-lg.hover:bg-gray-100.group.hover:shadow.dark:bg-gray-600.dark:hover:bg-gray-500.dark:text-white
       {:href "#"}
       ;; coinbase
       [:img.h-4 {:src "/images/coinbase.webp"}]
       [:span.flex-1.ml-3.whitespace-nowrap "Coinbase Wallet"]]]]
    [:div
     [:a.inline-flex.items-center.text-xs.font-normal.text-gray-500.hover:underline.dark:text-gray-400
      {:href "#"}
      ;; TODO: provide an explainer
      "\nWhy do I need to connect with my wallet?"]]]
    ]])

