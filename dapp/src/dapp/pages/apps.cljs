(ns dapp.pages.apps)

(defn apps-content
  []
  [:div.apps-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Apps"]])

(defn render
  []
  (fn []
    [:div.apps-container
     {:class "h-full"}
     [apps-content]]))
