(ns dapp.components.layout
  (:require
   [reagent.core :as r]
   [dapp.utils :as utils]
   [reitit.frontend.easy :as rfe]
   ["@heroicons/react/outline" :refer (ChartBarIcon, FolderIcon, HomeIcon, InboxIcon, MenuIcon, XIcon)]
   [headlessui-reagent.core :as ui]))

(def navigation
  [{:name "Dashboard" :href (rfe/href ::dashboard) :icon HomeIcon :current true}
   {:name "Team" :href "#" :icon FolderIcon :current false}
   {:name "Documents" :href "#" :icon InboxIcon :current false}
   {:name "Settings" :href (rfe/href ::settings) :icon ChartBarIcon :current false}])

(defn render [view]
  (r/with-let [!open? (r/atom false)
               open #(reset! !open? true)
               close #(reset! !open? false)]
[:div
 [ui/transition
  {:show @!open?}
  [ui/dialog
   {:as "div",
    :on-close close
    :class "fixed inset-0 flex z-40 md:hidden"}
   [ui/transition-child
    {
     ;:as fragment
     :enter "transition-opacity ease-linear duration-300",
     :enter-from "opacity-0",
     :enter-to "opacity-100",
     :leave "transition-opacity ease-linear duration-300",
     :leave-from "opacity-100",
     :leave-to "opacity-0"}
    [ui/dialog-overlay {:class "fixed inset-0 bg-gray-600 bg-opacity-75"}]]
   [ui/transition-child
    {
     ;:as fragment
     :class "z-50 fixed inset-0 flex"
     :enter "transition ease-in-out duration-300 transform",
     :enter-from "-translate-x-full", 
     :enter-to "translate-x-0",
     :leave "transition ease-in-out duration-300 transform",
     :leave-from "translate-x-0",
     :leave-to "-translate-x-full"}
    [:div.flex-1.flex.flex-col.max-w-xs.w-full.bg-gray-800.z-50.top-0.absolute.min-h-full
     [ui/transition-child
      {
        ;:as fragment
       :enter "ease-in-out duration-300",
       :enter-from "opacity-0",
       :enter-to "opacity-100",
       :leave "ease-in-out duration-300",
       :leave-from "opacity-100",
       :leave-to "opacity-0"}
      [:div.absolute.top-0.right-0.-mr-12.pt-2
       [:button.ml-1.flex.items-center.justify-center.h-10.w-10.rounded-full.focus:outline-none.focus:ring-2.focus:ring-inset.focus:ring-white
        {:type "button", :on-click close}
        [:span.sr-only "Close sidebar"]
        [XIcon {:aria-hidden "true" :class "h-6 w-6 text-white"}]]]]
     [:div.flex-1.h-0.pt-5.pb-4.overflow-y-auto
      [:div.flex-shrink-0.flex.items-center.px-4
       [:img.h-8.w-auto
        {:src
         "https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg",
         :alt "Workflow"}]]
      [:nav.mt-5.px-2.space-y-1
       (map
        (fn
         [item]
         [:a
         {:key (:name item),
          :href (:href item),
          :class
          (utils/classnames
           (if
            (:current item)
            "bg-gray-900 text-white"
            "text-gray-300 hover:bg-gray-700 hover:text-white")
           "group flex items-center px-2 py-2 text-base font-medium rounded-md")}
          [(r/adapt-react-class (:icon item))
          {:class
           (utils/classnames
            (if
             (:current item)
             "text-gray-300"
             "text-gray-400 group-hover:text-gray-300")
            "mr-4 flex-shrink-0 h-6 w-6"),
           :aria-hidden "true"}]
         (:name item)])
        navigation)]]
     [:div.flex-shrink-0.flex.bg-gray-700.p-4
      [:a.flex-shrink-0.group.block
       {:href "#"}
       [:div.flex.items-center
        [:div
         [:img.inline-block.h-10.w-10.rounded-full
          {:src
           "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
           :alt ""}]]
        [:div.ml-3
         [:p.text-base.font-medium.text-white "Tom Cook"]
         [:p.text-sm.font-medium.text-gray-400.group-hover:text-gray-300
          "View profile"]]]]]]]
   [:div.flex-shrink-0.w-14]]]

 ;;
 [:div.hidden.md:flex.md:w-64.md:flex-col.md:fixed.md:inset-y-0
  [:div.flex-1.flex.flex-col.min-h-0.bg-gray-800
   [:div.flex-1.flex.flex-col.pt-5.pb-4.overflow-y-auto
    [:div.flex.items-center.flex-shrink-0.px-4
     [:img.h-8.w-auto
      {:src
       "https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg",
       :alt "Workflow"}]]
    [:nav.mt-5.flex-1.px-2.space-y-1
     (map
      (fn
       [item]
       [:a
       {:key (:name item),
        :href (:href item),
        :class
        (utils/classnames
         (if
          (:current item)
          "bg-gray-900 text-white"
          "text-gray-300 hover:bg-gray-700 hover:text-white")
         "group flex items-center px-2 py-2 text-sm font-medium rounded-md")}
       [(r/adapt-react-class (:icon item))
        {:class
         (utils/classnames
          (if
           (:current item)
           "text-gray-300"
           "text-gray-400 group-hover:text-gray-300")
          "mr-3 flex-shrink-0 h-6 w-6"),
         :aria-hidden "true"}]
       (:name item)])
      navigation)]]
   [:div.flex-shrink-0.flex.bg-gray-700.p-4
    [:a.flex-shrink-0.w-full.group.block
     {:href "#"}
     [:div.flex.items-center
      [:div
       [:img.inline-block.h-9.w-9.rounded-full
        {:src
         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
         :alt ""}]]
      [:div.ml-3
       [:p.text-sm.font-medium.text-white "Tom Cook"]
       [:p.text-xs.font-medium.text-gray-300.group-hover:text-gray-200
        "View profile"]]]]]]]
 [:div.md:pl-64.flex.flex-col.flex-1
  [:div.sticky.top-0.z-10.md:hidden.pl-1.pt-1.sm:pl-3.sm:pt-3.bg-gray-100
   [:button.-ml-0.5.-mt-0.5.h-12.w-12.inline-flex.items-center.justify-center.rounded-md.text-gray-500.hover:text-gray-900.focus:outline-none.focus:ring-2.focus:ring-inset.focus:ring-indigo-500
    {:type "button", :on-click open}
    [:span.sr-only "Open sidebar"]
    [MenuIcon {:aria-hidden "true"}]]]
  [:main.flex-1
   (view nil)]]]))

