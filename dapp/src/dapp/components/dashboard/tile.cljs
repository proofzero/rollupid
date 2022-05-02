(ns dapp.components.dashboard.tile)

(defn render
  [{:keys [id heading metric-data]}]
  (let [{:keys [base current]} metric-data]
    [:div.metric-container
     {:id id
      :class "flex flex-col bg-white w-1/3 h-24 m-4 rounded shadow"}
     [:p
      {:class "text-gray-900 ml-4 mt-4 text-sm font-light w-full"}
      heading]
     [:div
      {:class "flex flex-row items-end w-full"}
      [:p
       {:class "text-indigo-600 ml-4 mt-3 text-xl"}
       current]
      [:p
       {:class "text-gray-500 ml-2 mt-3 pb-1 text-xs"}
       (str "from " base)]
      [:div.trend-pill
       {:class "h-5 w-10 bg-green-100 rounded-full flex flex-row
                justify-center items-center ml-auto mr-4"}
       [:img
        {:class "h-2 mr-1"
         :src "images/green-arrow.svg"}]
       [:p
        {:class "text-green-800 text-xs font-light"}
        "Na"]]]]))
