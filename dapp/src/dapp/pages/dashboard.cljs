(ns dapp.pages.dashboard
  (:require
   [dapp.components.button :as button]
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

(defn dashboard-content
  [logged-in?]
  [:div.dashboard-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Dashboard"]
   (when-not logged-in?
     [connect-wallet])])

(defn render
  []
  (let [logged-in? (re-frame/subscribe [:dapp.wallet/logged-in?])]
    (fn []
      [:div.dashboard-container
       {:class "h-full"}
       [dashboard-content @logged-in?]])))
