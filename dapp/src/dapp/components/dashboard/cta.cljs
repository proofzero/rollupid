(ns dapp.components.dashboard.cta
  "Call to action component")

(defn render
  [{:keys [heading
           id
           image-file
           link
           paragraph]}]
  [:a
   {:class "bg-white w-1/2 h-40 rounded shadow
            flex flex-col mx-4 cursor-pointer"
    :href link
    :id id
    :target "_blank"}
   [:div.icons-container
    {:class "flex flex-row w-full h-10 justify-between mt-4"}
    [:img
     {:class "bg-indigo-50 p-3 rounded-lg ml-4"
      :src image-file}]
    [:img
     {:class "h-4 mr-4"
      :src "images/cta-arrow.svg"}]]
   [:div.dashboard-helper-content
    {:class "flex flex-col w-full justify-between"}
    [:h1
     {:class "text-gray-900 ml-4 mt-4"}
     heading]
    [:p
     {:class "text-gray-500 text-xs ml-4"}
     paragraph]]])
