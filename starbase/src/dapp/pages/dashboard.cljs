(ns dapp.pages.dashboard
  (:require
   [dapp.components.button :as button]
   [dapp.components.dashboard.cta :as dashboard-cta]
   [dapp.components.dashboard.tile :as dashboard-tile]
   [dapp.components.web3-modal :as web3-modal]
   [re-frame.core :as re-frame]))

(defn connect-wallet
  []
  [:div.connect-wallet
   {:class "flex flex-col mt-36 content-center text-center"}
   [:img
    {:class "h-8"
     :src "images/wallet.svg"}]
   [:p
    {:class "text-gray-900 text-sm mt-4"}
    "Connect a Wallet"]
   [:p
    {:class "text-gray-500 text-sm my-1"}
    "Get started by connecting your wallet."]
   [button/render {:id "connect-a-wallet"
                   :class "self-center mt-6"
                   :text "Connect a Wallet"
                   :on-click (fn [e]
                               (.preventDefault e)
                               (web3-modal/open-modal))
                   :variant :primary}]])

(defn create-an-app
  []
  [:div.create-an-app
   {:class "flex flex-col my-8 content-center text-center"}
   [:img
    {:class "h-8"
     :src "images/folder-create.svg"}]
   [:p
    {:class "text-gray-900 text-sm mt-4"}
    "No apps"]
   [:p
    {:class "text-gray-500 text-sm my-1"}
    "Get started by creating a new app."]
   [button/render {:id "create-an-app"
                   :class "self-center mt-6"
                   :text "Create an App"
                   ;; TODO: Unimplemented
                   :on-click (fn [e]
                               (.preventDefault e))
                   :variant :primary}]])

(defn root-core-details
  []
  [:div.root-core-details
   [:div.metrics
    {:class "flex flex-row"}

    ;; Dashboard Metrics
    [dashboard-tile/render
     {:id "metrics-1"
      :heading "Dummy metrics"
      :metric-data {:base "70,946"
                    :current "71,897"}}]
    [dashboard-tile/render
     {:id "metrics-2"
      :heading "Dummy metrics"
      :metric-data {:base "70,946"
                    :current "71,897"}}]
    [dashboard-tile/render
     {:id "metrics-3"
      :heading "Dummy metrics"
      :metric-data {:base "70,946"
                    :current "71,897"}}]]

   ;; Dashboard calls to action
   [:div.calls-to-action
    {:class "mt-8 flex flex-row"}
    [dashboard-cta/render
     {:heading "Join our community"
      :id "community-cta"
      :image-file "images/community.svg"
      :link "https://discord.gg/rQdPmUyk8p"
      ;; TODO: Needs better copy
      :paragraph "Link to our Discord server"}]
    [dashboard-cta/render
     {:heading "Learn best practices"
      :id "best-practices-cta"
      :image-file "images/learn.svg"
      :link "https://kubelt.com/docs/next/basics/introduction/"
      ;; TODO: Needs better copy
      :paragraph "Link to our docs"}]]

   ;; Create a new app OR view active apps
   [:div.active-apps
    {:class "mt-8 flex flex-col"}
    [:h1
     {:class "ml-6 text-gray-900 font-semibold"}
     "Most Active Apps"]
    [create-an-app]]])

(defn dashboard-content
  [logged-in?]
  [:div.dashboard-content
   {:class "bg-gray-100 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Dashboard"]
   (if logged-in?
     [root-core-details]
     [connect-wallet])])

(defn render
  []
  (let [logged-in? (re-frame/subscribe [:dapp.wallet/logged-in?])]
    (fn []
      [:div.dashboard-container
       {:class "h-full"}
       [dashboard-content @logged-in?]])))
