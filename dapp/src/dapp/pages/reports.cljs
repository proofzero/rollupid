(ns dapp.pages.reports)

(defn reports-content
  []
  [:div.reports-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Reports"]])

(defn render
  []
  (fn []
    [:div.reports-container
     {:class "h-full"}
     [reports-content]]))
