(ns dapp.pages.cores)

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
     {:class "h-full"}
     [cores-content]]))
