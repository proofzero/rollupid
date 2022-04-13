(ns dapp.pages.dashboard
  (:require
   [dapp.components.button :as button]
   [dapp.components.header :as header]
   [dapp.components.web3-modal :as web3-modal]))

(defn connect-wallet
  []
  (fn []
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
                     :variant :primary}]]))

(defn dashboard-content
  []
  [:div.dashboard-content
   {:class "bg-gray-200 h-full flex flex-col"}
   [:h1
    {:class "mt-6 ml-6 text-xl w-auto"}
    "Dashboard"]
   ;; TODO: When wallet is disconnected or not logged in, show the `connect-wallet` component.
   ;; Wallet connected views to be worked on shortly.
   [connect-wallet]])

(defn render
  []
  (fn []
    [:div.dashboard-container
     {:class "w-4/5 flex flex-col"}
     [header/render]
     [dashboard-content]]))
