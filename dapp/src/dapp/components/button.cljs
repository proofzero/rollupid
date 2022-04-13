(ns dapp.components.button)

(defn render
  [{:keys [class id on-click text variant]}]
  [:button
   {:id id
    :on-click on-click
    :class (str "rounded-sm text-white text-sm w-36 px-4 py-2 shadow-md "
                class
                (case variant
                  :primary " bg-indigo-500 hover:bg-indigo-700 "
                  " bg-gray-300"))}
   text])
