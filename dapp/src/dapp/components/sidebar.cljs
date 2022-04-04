(ns dapp.components.sidebar
  (:require
   [dapp.routes :as routes])
  (:require
   ["@heroicons/react/outline" :refer (ChartBarIcon, FolderIcon, HomeIcon)]
   ))

(defn- sidebar-header
  [{:keys [organization-logo organization-name]}]
  [:div.sidebar-header
   {:class "flex items-center h-16 mb-4 pt-4"}
   [:div.organization-logo
    {:class "ml-6"}
    organization-logo]
   [:p.organization-name
    {:class "text-gray-100 text-2xl ml-1 self-end"}
    organization-name]])

(defn- determine-text-color
  [current-route-name route-name]
  (if (= current-route-name route-name)
    "text-white bg-gray-800"
    "text-gray-700 hover:bg-gray-700 hover:text-white"))

(defn- sidebar-tab
  [{:keys [current-route-name
           route-name
           tab-icon
           tab-name] :as _props}]
  [:a.sidebar-tab
   {:href  (routes/href route-name)
    :class (str "group flex items-center p-2 rounded-md "
                (determine-text-color current-route-name route-name))}
   [:> tab-icon
    {:class "mr-2 h-6 w-6"}]
   tab-name])

(defn render
  [_router current-route]
  [:div.sidebar
   {:class "w-1/5 bg-gray-900 h-screen"}

   [:div.sidebar-container
    {:class "h-screen flex flex-col flex-end"}

    ;; TODO: Parameterize header
    ;; Allow companies to introduce their own branding here.
    [sidebar-header
     {:organization-logo
      [:img {:src "images/kubelt.svg"}]
      :organization-name "kubelt"}]

    ;; Sidebar tabs
    [:nav
     {:class "mt-4 px-2 space-y-2"}
     [sidebar-tab
      {:route-name ::routes/dashboard
       :current-route-name (get-in current-route [:data :name])
       :tab-icon HomeIcon
       :tab-name "Dashboard"}]

     [sidebar-tab
      {:route-name ::routes/cores
       :current-route-name (get-in current-route [:data :name])
       :tab-icon FolderIcon
       :tab-name "Cores"}]

     [sidebar-tab
      {:route-name ::routes/reports
       :current-route-name (get-in current-route [:data :name])
       :tab-icon ChartBarIcon
       :tab-name "Reports"}]]]])
