(ns dapp.pages.cores
  (:require
   [dapp.components.header :as header]))

(defn cores-content
  []
  [:div.cores-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Cores"]])

(defn render
  []
  (fn []
    [:div.cores-container
     {:class "w-4/5 flex flex-col"}
     [header/render]
     [cores-content]]))
